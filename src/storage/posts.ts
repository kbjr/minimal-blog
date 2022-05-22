
import { obj } from '../util';
import { conf } from '../conf';
import { store } from './store';
import { render_markdown_to_html } from '../markdown';
import { throw_422_unprocessable_entity } from '../http-error';

type PostType = 'post' | 'comment';

// Note: `posts` is ordered with the most recent post first
let posts: PostData[];
let posts_index: Record<PostType, Record<string, PostData>>;

export async function load() {
	posts = await store.get_all_posts();
	posts_index = obj({
		post: obj(),
		comment: obj(),
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

export class Post {
	constructor(private data: PostData) { }

	get post_url() {
		switch (this.data.post_type) {
			case 'post': return `${conf.http.web_url}/posts/${this.data.uri_name}`;
			case 'comment': return `${conf.http.web_url}/comments/${this.data.uri_name}`;
		}
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

	get date_published() {
		return this.data.date_published;
	}

	get date_updated() {
		return this.data.date_updated;
	}

	get tags() {
		return this.data.tags;
	}
}
