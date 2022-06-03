
import { MicroformatRoot, read_url_as_post } from './parse';
import { ExternalAuthor, read_author_from_prop } from './author';
import { take_first, mf2_extract_date, mf2_extract_str } from './utils';

export interface ExternalEvent {
	url: string;
	title: string;
	subtitle?: string;
	author?: ExternalAuthor;
	start?: string;
	end?: string;
	published?: string;
	updated?: string;
	content_preview?: string;
}

// todo: should there be another layer of caching on this function?

export async function read_as_event(url: string, skip_cache = false) {
	const { title, open_graph, microformats } = await read_url_as_post(url, skip_cache);

	const event: ExternalEvent = {
		url,
		title: null,
		subtitle: null,
		author: null,
		start: null,
		end: null,
		published: null,
		updated: null,
		content_preview: null,
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
			event.content_preview = full_content.length > 250 ? full_content.slice(0, 200) + '&hellip;' : full_content;
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
		event.published = take_first(open_graph['article:published_time']);
	}

	if (! event.updated && open_graph['article:modified_time']) {
		event.updated = take_first(open_graph['article:modified_time']);
	}

	return event;
}
