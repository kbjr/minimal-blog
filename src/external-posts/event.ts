
import { conf } from '../conf';
import { Cache } from '../cache';
import { store } from '../storage';
import { MicroformatRoot, parse_url_response } from './parse';
import { ExternalAuthor, read_author_from_prop } from './author';
import { take_first, mf2_extract_date, mf2_extract_str, url_is_local, url_to_local_path, as_date, truncate_str } from './utils';
import { wrap_date } from '../util';

const event_cache = new Cache<ExternalEvent>(
	conf.data.caches.external_event.max_size,
	conf.data.caches.external_event.max_age,
	conf.data.caches.external_event.cycle_count,
);

export interface ExternalEventData {
	url: string;
	title: string;
	subtitle?: string;
	author?: ExternalAuthor;
	start?: Date;
	end?: Date;
	published?: Date;
	updated?: Date;
	content_preview?: string;
	local_post?: store.posts.Post;
}

export async function read_as_event(url: string, skip_cache = false) {
	if (url_is_local(url)) {
		const path = url_to_local_path(url);
		// todo: shortcut to just load info from storage
	}

	if (! skip_cache) {
		const cached = event_cache.get_from_cache(url);
	
		if (cached) {
			return cached;
		}
	}

	const { title, open_graph, microformats } = await parse_url_response(url, skip_cache);

	const event: ExternalEventData = {
		url,
		title: null,
		subtitle: null,
		author: null,
		start: null,
		end: null,
		published: null,
		updated: null,
		content_preview: null,
		local_post: null,
	};

	let h_event: MicroformatRoot;
	
	// Look through the items for an `h-event`, and take the first
	// one we find
	doc_loop:
	for (const item of microformats.items) {
		if (! item.type) {
			continue doc_loop;
		}

		if (item.type.includes('h-event')) {
			h_event = item;
			break doc_loop;
		}

		if (item.type.includes('h-feed') && item.children) {
			feed_loop:
			for (const child of item.children) {
				if (! child.type) {
					continue feed_loop;
				}
		
				if (child.type.includes('h-event')) {
					h_event = child;
					break doc_loop;
				}
			}
		}
	}

	// If we found an `h-event`, scrape any data off of it that we can
	if (h_event) {
		const { name, summary, author, start, end, published, updated, content } = h_event.properties;

		event.title = mf2_extract_str(name);
		event.subtitle = mf2_extract_str(summary);
		event.author = read_author_from_prop(author);
		event.start = mf2_extract_date(start);
		event.end = mf2_extract_date(end);
		event.published = mf2_extract_date(published);
		event.updated = mf2_extract_date(updated);

		const full_content = mf2_extract_str(content);

		if (full_content) {
			event.content_preview = truncate_str(full_content, 250, 240);
		}
	}

	// Try to find any data we don't already have from `h-feed` from
	// any other parsed source available
	if (! event.title) {
		event.title = open_graph.title
			? Array.isArray(open_graph.title)
				? open_graph.title[0]
				: open_graph.title
			: title
		;
	}

	if (! event.content_preview && open_graph.description) {
		event.content_preview = take_first(open_graph.description);
	}

	if (! event.author && open_graph['article:author']) {
		event.author = {
			author_url: take_first(open_graph['article:author'])
		};
	}

	if (! event.published && open_graph['article:published_time']) {
		event.published = as_date(take_first(open_graph['article:published_time']));
	}

	if (! event.updated && open_graph['article:modified_time']) {
		event.updated = as_date(take_first(open_graph['article:modified_time']));
	}

	const wrapped = new ExternalEvent(event);
	event_cache.store_to_cache(url, wrapped);

	return wrapped;
}



export class ExternalEvent {
	constructor(
		private readonly data: ExternalEventData
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

	get start() {
		return wrap_date(this.data.start);
	}

	get end() {
		return wrap_date(this.data.end);
	}

	get content_preview() {
		return this.data.content_preview;
	}

	get local_post() {
		return this.data.local_post;
	}
}

