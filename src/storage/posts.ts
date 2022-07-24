
import { obj } from '../util';
import { conf } from '../conf';
import { events, store } from './store';
import { render_markdown_to_html } from '../markdown';
import { throw_404_not_found, throw_422_unprocessable_entity } from '../http-error';
import * as settings from './settings';
import { ExternalEntry, ExternalEvent } from '../external-posts';
import { Mention } from './mentions';

export type PostType = 'post' | 'comment' | 'note' | 'event' | 'rsvp';
// | 'poll' | 'poll-response' | 'share' | 'like/reaction' | 'media-album' | 'recipe'

export function post_types() : PostType[] {
	return ['post', 'comment', 'note', 'event', 'rsvp'];
}

// Note: `posts` is ordered with the most recently published post first
let posts: PostData[];
let posts_index: Record<PostType, Record<string, PostData>>;

let tags: Tag[];
let tags_index: Record<string, Tag>;

export async function load() {
	// todo: map to Post instances here
	// todo: generate post preview here
	posts = await store.get_all_posts();
	tags = (await store.list_all_tags()).map((data) => new Tag(data)).sort(sort_tags);
	posts_index = obj({
		post: obj(),
		comment: obj(),
		note: obj(),
		event: obj(),
		rsvp: obj(),
	});
	tags_index = obj();

	for (const post of posts) {
		posts_index[post.post_type][post.uri_name] = post;
	}

	for (const tag of tags) {
		tags_index[tag.tag_name] = tag;
	}
}

export async function get_draft_posts(count: number) {
	const results: PostData[] = [ ];

	for (const post of posts) {
		if (post.is_draft) {
			results.push(post);
			
			if (results.length === count) {
				break;
			}
		}
	}

	return results;
}

export function get_post(post_type: PostType, post_uri: string) {
	return posts_index[post_type]?.[post_uri];
}

export function get_posts(count: number, tagged_with?: string, before?: string, post_type?: PostType, include_drafts?: boolean) {
	let results = posts;

	if (before) {
		const timestamp = Date.parse(before);
		const index = results.findIndex((post) => {
			return Date.parse(post.date_published) < timestamp;
		});

		if (index < 0) {
			return [ ];
		}

		results = results.slice(index);
	}

	if (tagged_with) {
		results = results.filter((post) => {
			return post.tags.includes(tagged_with);
		});
	}

	if (post_type) {
		results = results.filter((post) => {
			return post.post_type === post_type;
		});
	}

	if (! include_drafts) {
		results = results.filter((post) => ! post.is_draft);
	}

	return results.slice(0, count);
}

export async function search_posts(query: string) {
	if (! conf.data.enable_search) {
		return [ ];
	}
	
	const results = await store.search_posts(query);

	return results.map((result) => {
		const data: PostData = posts_index[result.post_type][result.uri_name];
		return Object.assign<SearchResult, PostData>(result, data);
	});
}

export async function create_post(data: PostDataPatch) : Promise<PostData> {
	data.content_html = await render_markdown_to_html(data.content_markdown, { });
	
	if (posts_index[data.post_type][data.uri_name]) {
		throw_422_unprocessable_entity(`post_type "${data.post_type}" with uri_name "${data.uri_name}" already exists`);
	}

	const full_post = await store.create_post(data);
	posts.unshift(full_post);
	posts_index[data.post_type][data.uri_name] = full_post;
	add_tags(full_post.tags);
	events.emit('posts.create');
	return full_post;
}

export async function update_post(post_type: PostType, uri_name: string, updates: Partial<PostData>) {
	const post = get_post(post_type, uri_name);

	if (! post) {
		throw_404_not_found(`post_type "${post_type}" with uri_name "${uri_name}" not found`);
	}

	if (post.is_draft && updates.is_draft === false) {
		// if this is the post being initially published, set the publish time
		updates.date_published = (new Date).toISOString();
		// move the post to the front of the list so it shows up in correct,
		// publish-sorted order
		const orig_index = posts.findIndex((data) => data === post);
		posts.splice(orig_index, 1);
		posts.unshift(post);
	}

	else if (! post.is_draft && updates.is_draft !== true) {
		// if the entry was already previously published, set the update time
		updates.date_updated = (new Date).toISOString();
	}

	if ('content_markdown' in updates) {
		updates.content_html = await render_markdown_to_html(updates.content_markdown, { });
	}

	if ('tags' in updates) {
		const old_tags = post.tags;
		const new_tags = updates.tags;
		const old_tags_set = new Set(old_tags);
		const new_tags_set = new Set(new_tags);
	
		const tags_to_add: string[] = [ ];
		const tags_to_remove: string[] = [ ];
	
		for (const tag of old_tags) {
			if (! new_tags_set.has(tag)) {
				drop_tag(tag);
				tags_to_remove.push(tag);
			}
		}
	
		for (const tag of new_tags) {
			if (! old_tags_set.has(tag)) {
				tags_to_add.push(tag);
			}
		}
	
		if (tags_to_remove.length) {
			await store.delete_post_tags(post.post_id, tags_to_remove);
		}
	
		if (tags_to_add.length) {
			add_tags(tags_to_add);
			await store.create_post_tags(post.post_id, tags_to_add);
		}
	
		post.tags = new_tags;
		delete updates.tags;
	}

	Object.assign(post, updates);
	await store.update_post(post);
	events.emit('posts.update', post);
	return post;
}

export async function delete_post(post_type: PostType, uri_name: string) {
	const post = get_post(post_type, uri_name);

	if (! post) {
		throw_404_not_found(`post_type "${post_type}" with uri_name "${uri_name}" not found`);
	}

	delete posts_index[post_type][uri_name];
	posts.splice(posts.findIndex((elem) => elem === post), 1);
	await store.delete_post(post_type, uri_name);
	events.emit('posts.delete', post);
}

export function list_tags() {
	return tags.slice();
}

function add_tags(new_tags: string[]) {
	for (const tag of new_tags) {
		if (! tags_index[tag]) {
			const new_tag = new Tag({
				tag_name: tag,
				tag_count: 1
			});

			tags.push(new_tag);
			tags.sort(sort_tags);
			tags_index[tag] = new_tag;
			continue;
		}

		tags_index[tag].add_ref();
	}
}

function drop_tag(tag: string) {
	if (tags_index[tag]) {
		tags_index[tag].drop_ref();
	}
}

function sort_tags(tag_a: Tag, tag_b: Tag) {
	return tag_a.tag_name.localeCompare(tag_b.tag_name);
}

export interface PostData {
	post_id: number;
	post_type: PostType;
	uri_name: string;
	title?: string;
	subtitle?: string;
	external_url?: string;
	content_html: string;
	content_markdown: string;
	image?: string;
	banner_image?: string;
	is_draft: boolean;
	date_published: string;
	date_updated: string;
	date_event_start?: string;
	date_event_end?: string;
	rsvp_type?: 'yes' | 'no' | 'maybe' | 'interested';
	tags: string[];
}

export interface PostDataPatch {
	post_type: PostType;
	uri_name: string;
	title?: string;
	subtitle?: string;
	external_url?: string;
	content_html?: string;
	content_markdown?: string;
	image?: string;
	banner_image?: string;
	is_draft: boolean;
	date_event_start?: string;
	date_event_end?: string;
	rsvp_type?: 'yes' | 'no' | 'maybe' | 'interested';
	tags?: string[];
}

export interface TagData {
	tag_name: string;
	tag_count: number;
}

export interface SearchResult {
	post_type: PostType;
	uri_name: string;
	search_score: number;
}

// export interface FullPostData extends PostData {
// 	attachments: AttachmentData[];
// }

// export interface AttachmentData {
// 	uri_name: string;
// 	attachment_file: string;
// 	mime_type: string;
// 	title?: string;
// 	size_in_bytes: number;
// 	duration_in_seconds?: number;
// }

export class Tag implements Readonly<TagData> {
	private last_mod = Date.now();

	constructor(private data: TagData) { }

	public get tag_name() {
		return this.data.tag_name;
	}

	public get tag_count() {
		return this.data.tag_count;
	}

	public get tag_url() {
		return `${conf.http.web_url}/tagged/${this.tag_name}`;
	}

	public get tag_last_modified_iso() {
		return (new Date(this.last_mod)).toISOString();
	}

	public add_ref() {
		this.data.tag_count++;
		this.last_mod = Date.now();
	}

	public drop_ref() {
		this.data.tag_count--;
		this.last_mod = Date.now();
	}
}

export class Post implements Readonly<PostData> {
	public mentions: Mention[];
	public external_data: ExternalEvent | ExternalEntry;

	constructor(private data: PostData & Partial<SearchResult>) { }

	get post_url() {
		return `${conf.http.web_url}/${this.data.post_type}/${this.data.uri_name}`;
	}

	get is_post() {
		return this.data.post_type === 'post';
	}

	get is_comment() {
		return this.data.post_type === 'comment';
	}

	get is_note() {
		return this.data.post_type === 'note';
	}

	get is_event() {
		return this.data.post_type === 'event';
	}

	get is_rsvp() {
		return this.data.post_type === 'rsvp';
	}

	get author_name() {
		return settings.get('author_name') || 'Anonymous';
	}

	get author_url() {
		return settings.get('author_url');
	}

	get author_avatar() {
		return settings.get('author_avatar');
	}

	get post_id() {
		return this.data.post_id;
	}

	get post_type() {
		return this.data.post_type;
	}

	get uri_name() {
		return this.data.uri_name;
	}

	get title() {
		return this.data.title;
	}

	get subtitle() {
		return this.data.subtitle;
	}

	get external_url() {
		return this.data.external_url;
	}

	get content_html() {
		return this.data.content_html;
	}

	get content_markdown() {
		return this.data.content_markdown;
	}

	get image() {
		return this.data.image;
	}

	get banner_image() {
		return this.data.banner_image;
	}

	get is_draft() {
		return this.data.is_draft;
	}

	get date_published_iso() {
		return this.data.date_published;
	}

	get date_updated_iso() {
		return this.data.date_updated;
	}

	get date_event_start_iso() {
		return this.data.date_event_start;
	}

	get date_event_end_iso() {
		return this.data.date_event_end;
	}

	get date_published() {
		return this.date_published_utc;
	}

	get date_updated() {
		return this.date_updated_utc;
	}

	get date_published_utc() {
		return (new Date(this.data.date_published)).toUTCString();
	}

	get date_updated_utc() {
		return (new Date(this.data.date_updated)).toUTCString();
	}

	get date_event_start_utc() {
		return (new Date(this.data.date_event_start)).toUTCString();
	}

	get date_event_end_utc() {
		return (new Date(this.data.date_event_end)).toUTCString();
	}

	get rsvp_type() {
		return this.data.rsvp_type;
	}

	get rsvp_yes() {
		return this.data.rsvp_type === 'yes';
	}

	get rsvp_no() {
		return this.data.rsvp_type === 'no';
	}

	get rsvp_maybe() {
		return this.data.rsvp_type === 'maybe';
	}

	get rsvp_interested() {
		return this.data.rsvp_type === 'interested';
	}

	get tags() {
		// TODO: Move this sort() somewhere more efficient
		return this.data.tags.sort().slice();
	}

	get mentions_top_5() {
		return this.mentions.slice(0, 5);
	}

	get mentions_top_10() {
		return this.mentions.slice(0, 10);
	}

	get search_score() {
		return this.data.search_score.toFixed(5);
	}
}
