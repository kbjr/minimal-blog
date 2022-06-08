
import { conf } from '../conf';
import { Cache } from '../cache';
import { store } from '../storage';
import { MicroformatRoot, parse_url_response } from './parse';
import { ExternalAuthor, read_author_from_prop } from './author';
import { take_first, mf2_extract_date, mf2_extract_str, as_date, truncate_str, mf2_extract_html } from './utils';
import { ExternalInReplyTo, read_in_reply_to_from_prop } from './in-reply-to';
import { wrap_date } from '../util';
import { parse_local_url, url_is_local } from './local';

const post_cache = new Cache<ExternalEntry>(
	conf.data.caches.external_entry.max_size,
	conf.data.caches.external_entry.max_age,
	conf.data.caches.external_entry.cycle_count,
);

export interface ExternalEntryData {
	url: string;
	title?: string;
	subtitle?: string;
	author?: ExternalAuthor;
	published?: Date;
	updated?: Date;
	full_content?: string;
	content_preview?: string;
	in_reply_to?: ExternalInReplyTo[];
	like_of?: ExternalInReplyTo[];
	repost_of?: ExternalInReplyTo[];
	bookmark_of?: ExternalInReplyTo[];
	rsvp_type?: 'yes' | 'no' | 'maybe' | 'interested';
	is_local?: boolean;
}

export async function read_as_entry(url: string, skip_cache = false) {
	if (! skip_cache) {
		const cached = post_cache.get_from_cache(url);
	
		if (cached) {
			return cached;
		}
	}

	if (url_is_local(url)) {
		return read_local_as_entry(url);
	}

	const { title, open_graph, microformats } = await parse_url_response(url, skip_cache);

	const entry: ExternalEntryData = {
		url,
		title: null,
		subtitle: null,
		author: null,
		published: null,
		updated: null,
		full_content: null,
		content_preview: null,
		in_reply_to: null,
		like_of: null,
		repost_of: null,
		bookmark_of: null,
		rsvp_type: null,
		is_local: false,
	};

	let h_entry: MicroformatRoot;
	
	// Look through the items for an `h-entry`, and take the first
	// one we find
	doc_loop:
	for (const item of microformats.items) {
		if (! item.type) {
			continue doc_loop;
		}

		if (item.type.includes('h-entry')) {
			h_entry = item;
			break doc_loop;
		}

		if (item.type.includes('h-feed') && item.children) {
			feed_loop:
			for (const child of item.children) {
				if (! child.type) {
					continue feed_loop;
				}
		
				if (child.type.includes('h-entry')) {
					h_entry = child;
					break doc_loop;
				}
			}
		}
	}

	// If we found an `h-entry`, scrape any data off of it that we can
	if (h_entry) {
		const { name, summary, author, published, updated, content } = h_entry.properties;

		entry.title = mf2_extract_str(name);
		entry.subtitle = mf2_extract_str(summary);
		entry.author = read_author_from_prop(author);
		entry.published = mf2_extract_date(published);
		entry.updated = mf2_extract_date(updated);
		entry.in_reply_to = read_in_reply_to_from_prop(h_entry.properties['in-reply-to']);
		entry.like_of = read_in_reply_to_from_prop(h_entry.properties['like-of']);
		entry.repost_of = read_in_reply_to_from_prop(h_entry.properties['repost-of']);
		entry.bookmark_of = read_in_reply_to_from_prop(h_entry.properties['bookmark-of']);

		const rsvp = mf2_extract_str(h_entry.properties.rsvp);

		if (rsvp) {
			entry.rsvp_type = rsvp.toLowerCase() as ExternalEntryData['rsvp_type'];
		}

		const text_content = mf2_extract_str(content);
		const full_content = mf2_extract_html(content);

		if (text_content) {
			entry.content_preview = truncate_str(text_content, 250, 240);
		}

		if (full_content) {
			entry.full_content = full_content;
		}
	}

	// Try to find any data we don't already have from `h-feed` from
	// any other parsed source available
	if (! entry.title) {
		entry.title = open_graph.title
			? Array.isArray(open_graph.title)
				? open_graph.title[0]
				: open_graph.title
			: title
		;
	}

	if (! entry.content_preview && open_graph.description) {
		entry.content_preview = take_first(open_graph.description);
	}

	if (! entry.author && open_graph['article:author']) {
		entry.author = {
			author_url: take_first(open_graph['article:author'])
		};
	}

	if (! entry.published && open_graph['article:published_time']) {
		entry.published = as_date(take_first(open_graph['article:published_time']));
	}

	if (! entry.updated && open_graph['article:modified_time']) {
		entry.updated = as_date(take_first(open_graph['article:modified_time']));
	}

	const wrapped = new ExternalEntry(entry);
	post_cache.store_to_cache(url, wrapped);

	return wrapped;
}

async function read_local_as_entry(url: string) {
	let entry: ExternalEntryData;
	const parsed = parse_local_url(url);

	switch (parsed.type) {
		case 'post':
			const post = await store.posts.get_post(parsed.post_type, parsed.uri_name);

			entry = {
				url,
				title: post.title,
				subtitle: post.subtitle,
				author: {
					author_name: store.settings.get('author_name'),
					author_url: store.settings.get('author_url'),
					author_avatar: store.settings.get('author_avatar'),
				},
				published: post.date_published ? new Date(post.date_published) : null,
				updated: post.date_updated ? new Date(post.date_updated) : null,
				full_content: post.content_html,
				in_reply_to: post.external_url ? [{ url: post.external_url }] : null,
				rsvp_type: post.rsvp_type,
				is_local: true,
			};
			break;

		default:
			// todo: better representation of other pages
			entry = { url, is_local: true };
			break;
	}

	const wrapped = new ExternalEntry(entry);
	post_cache.store_to_cache(url, wrapped);

	return wrapped;
}



export class ExternalEntry {
	public context: store.posts.Post;

	constructor(
		private readonly data: ExternalEntryData
	) { }

	get is_local() {
		return this.data.is_local;
	}

	get url() {
		return this.data.url;
	}

	get title() {
		return this.data.title;
	}

	get subtitle() {
		return this.data.subtitle;
	}

	get author() {
		return this.data.author;
	}

	get published() {
		return wrap_date(this.data.published);
	}

	get updated() {
		return wrap_date(this.data.updated);
	}

	get full_content() {
		return this.data.full_content;
	}

	get content_preview() {
		return this.data.content_preview;
	}

	get in_reply_to() {
		return this.data.in_reply_to;
	}

	get like_of() {
		return this.data.like_of;
	}

	get repost_of() {
		return this.data.repost_of;
	}

	get bookmark_of() {
		return this.data.bookmark_of;
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
}
