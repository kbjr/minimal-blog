
import { conf } from '../conf';
import { Cache } from '../cache';
import { store } from '../storage';
import { MicroformatRoot, parse_url_response } from './parse';
import { ExternalAuthor, read_author_from_prop } from './author';
import { take_first, mf2_extract_date, mf2_extract_str, url_is_local, url_to_local_path, as_date, truncate_str } from './utils';
import { ExternalInReplyTo, read_in_reply_to_from_prop } from './in-reply-to';
import { wrap_date } from '../util';

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
	content_preview?: string;
	in_reply_to?: ExternalInReplyTo;
	rsvp_type?: 'yes' | 'no' | 'maybe' | 'interested';
	local_post?: store.posts.Post;
}

export async function read_as_entry(url: string, skip_cache = false) {
	if (url_is_local(url)) {
		const path = url_to_local_path(url);
		// todo: shortcut to just load info from storage
	}

	if (! skip_cache) {
		const cached = post_cache.get_from_cache(url);
	
		if (cached) {
			return cached;
		}
	}

	const { title, open_graph, microformats } = await parse_url_response(url, skip_cache);

	const entry: ExternalEntryData = {
		url,
		title: null,
		subtitle: null,
		author: null,
		published: null,
		updated: null,
		content_preview: null,
		in_reply_to: null,
		rsvp_type: null,
		local_post: null,
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

		const rsvp = mf2_extract_str(h_entry.properties.rsvp);

		if (rsvp) {
			entry.rsvp_type = rsvp.toLowerCase() as ExternalEntryData['rsvp_type'];
		}

		const full_content = mf2_extract_str(content);

		if (full_content) {
			entry.content_preview = truncate_str(full_content, 250, 240);
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



export class ExternalEntry {
	constructor(
		private readonly data: ExternalEntryData
	) { }

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

	get content_preview() {
		return this.data.content_preview;
	}

	get in_reply_to() {
		return this.data.in_reply_to;
	}

	get rsvp_type() {
		return this.data.rsvp_type;
	}

	get local_post() {
		return this.data.local_post;
	}
}
