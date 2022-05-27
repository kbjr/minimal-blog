
import { obj } from '../util';
import { conf } from '../conf';
import { events, store } from './store';
import { render_markdown_to_html } from '../markdown';
import { throw_422_unprocessable_entity } from '../http-error';
import * as settings from './settings';

type PostType = 'post' | 'comment' | 'note' | 'event' | 'rsvp';

// Note: `posts` is ordered with the most recent post first
let posts: PostData[];
let posts_index: Record<PostType, Record<string, PostData>>;

export async function load() {
	posts = await store.get_all_posts();
	posts_index = obj({
		post: obj(),
		comment: obj(),
		note: obj(),
		event: obj(),
		rsvp: obj(),
	});

	for (const post of posts) {
		posts_index[post.post_type][post.uri_name] = post;
	}

	// 
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

export async function get_post(post_type: PostType, post_uri: string) {
	return posts_index[post_type]?.[post_uri];
}

export async function get_posts(count: number, tagged_with?: string, before?: string, include_drafts?: boolean) {
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

	if (! include_drafts) {
		results = results.filter((post) => ! post.is_draft);
	}

	return results.slice(0, count);
}

export async function create_post(data: PostDataPatch) : Promise<PostData> {
	data.content_html = await render_markdown_to_html(data.content_markdown, { });
	
	if (posts_index[data.post_type][data.uri_name]) {
		throw_422_unprocessable_entity(`post_type "${data.post_type}" with uri_name "${data.uri_name}" already exists`);
	}

	const full_post = await store.create_post(data);
	posts.unshift(full_post);
	posts_index[data.post_type][data.uri_name] = full_post;
	events.emit('posts.create');
	return full_post;
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
	content_html: string;
	content_markdown: string;
	image?: string;
	banner_image?: string;
	is_draft: boolean;
	date_event_start?: string;
	date_event_end?: string;
	rsvp_type?: 'yes' | 'no' | 'maybe' | 'interested';
	tags: string[];
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

export class Post implements Readonly<PostData> {
	constructor(private data: PostData) { }

	get post_url() {
		switch (this.data.post_type) {
			case 'post': return `${conf.http.web_url}/posts/${this.data.uri_name}`;
			case 'comment': return `${conf.http.web_url}/comments/${this.data.uri_name}`;
			case 'note': return `${conf.http.web_url}/notes/${this.data.uri_name}`;
			case 'event': return `${conf.http.web_url}/events/${this.data.uri_name}`;
			case 'rsvp': return `${conf.http.web_url}/rsvps/${this.data.uri_name}`;
		}
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
		return settings.get('author_name');
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
		// FIXME: Return real data
		return ['raspberry-pi', 'k3s', 'kubernetes', 'manjaro-linux'];
		// return this.data.tags;
	}
}
