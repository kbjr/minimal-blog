
import { mf2 } from 'microformats-parser';
import { http_get } from '../outbound-http';
import { dict } from '../util';
import { parse_meta_tags } from './meta-tags';
import { parse_open_graph } from './open-graph';
import { html_to_dom } from './utils';

export type ParsedDocument = ReturnType<typeof parse_microformats>;
export type MicroformatRoot = ParsedDocument['items'][number];

const active_requests: Record<string, Promise<Readonly<ParseResult>>> = dict();

export interface ParseResult {
	url: string;
	title: string;
	meta: Record<string, string | string[]>;
	open_graph: Record<string, string | string[]>;
	microformats: ParsedDocument;
}

export async function read_url_as_post(url: string, skip_cache: boolean) : Promise<Readonly<ParseResult>> {
	if (! skip_cache) {
		const cached = get_from_cache(url);

		if (cached) {
			return cached;
		}
	}

	if (! active_requests[url]) {
		active_requests[url] = get_and_parse_url(url);

		try {
			return await active_requests[url];
		}

		finally {
			delete active_requests[url];
		}
	}

	return await active_requests[url];
}

async function get_and_parse_url(url: string, follow_cannonical = false) {
	const { status, body, headers, req } = await http_get(url, {
		accept: 'text/mfs+html, text/html',
		'user-agent': 'not a browser',
	});

	if (status >= 300 || status < 200) {
		// todo: follow redirects
		return null;
	}

	if (! is_html(headers['content-type'])) {
		return null;
	}

	// todo: should we respect cache-control, etc. headers on the response?
	//   what all would that involve?

	const microformats = parse_microformats(body, url);

	if (follow_cannonical) {
		// Redirect to a <link rel="cannonical"> source if available and not
		// what we already requested
		if ('cannonical' in microformats.rels) {
			const cannons = microformats.rels.cannonical;

			if (cannons.length && ! cannons.includes(url)) {
				return get_and_parse_url(cannons[0]);
			}

		}
	}
	
	const window = html_to_dom(url, body);
	const open_graph = parse_open_graph(window);

	if (follow_cannonical) {
		// Redirect to a <meta property="og:url"> source if available and not
		// what we already requested
		if (Array.isArray(open_graph.url)) {
			if (open_graph.url.length && ! open_graph.url.includes(url)) {
				return get_and_parse_url(open_graph.url[0]);
			}
		}
		
		else if (open_graph.url && open_graph.url !== url) {
			return get_and_parse_url(open_graph.url);
		}
	}

	const result: ParseResult = {
		url,
		title: window.document.title,
		meta: parse_meta_tags(window),
		open_graph,
		microformats,
	};

	store_to_cache(url, result);
	return result;
}

function parse_microformats(html: string, base_url: string) {
	return mf2(html, {
		baseUrl: base_url,
		experimental: {
			// lang,
			textContent: true,
		}
	});
}

function is_html(content_type: string) : content_type is `text/${'mfs+' | ''}html${`; ${string}` | ''}` {
	const mime_type = content_type.split(';')[0].trim();
	return mime_type === 'text/mfs+html' || mime_type === 'text/html';
}



// ===== Cache =====

const mf_cache_max_size = 200;
const mf_cache_max_age = 1000 * 60 * 60;
const mf_cache_index = dict<string, CachedMicroformats>();
const mf_cache_sorted = new Array<CachedMicroformats>();

class CachedMicroformats {
	public score = 2;
	public time = Date.now();

	constructor(
		public url: string,
		public data: ParseResult
	) { }

	public get age() {
		return Date.now() - this.time;
	}
}

function get_from_cache(url: string) {
	const entry = mf_cache_index[url];

	if (! entry) {
		return null;
	}

	// Make sure the cache entry isn't expired before returning it
	if (entry.age > mf_cache_max_age) {
		const index = mf_cache_sorted.findIndex((found) => found === entry);
		mf_cache_sorted.splice(index, 1);
		delete mf_cache_index[entry.url];
		return null;
	}

	entry.score++;
	return entry.data;
}

const cycle_count = 10
let cycle_index = cycle_count;

function store_to_cache(url: string, data: ParseResult) {
	if (mf_cache_index[url]) {
		mf_cache_index[url].time = Date.now();
		mf_cache_index[url].data = data;
	}

	else {
		const entry = new CachedMicroformats(url, data);
	
		mf_cache_sorted.push(entry);
		mf_cache_index[url] = entry;
	}

	// Decrement on each store() until we reach 0, then do a
	// sweep and reset the counter
	if (! cycle_index--) {
		cycle_index = cycle_count;

		sweep_cache();
	}

	// If at any point we still reach the max cache size, just
	// drop the oldest records to make space
	if (mf_cache_sorted.length >= mf_cache_max_size) {
		clear_oldest();
	}
}

/**
 * Tier-one cache clear; Checks entry scores for things that
 * don't look like they've received frequent/recent use, or that
 * are expired
 */
function sweep_cache() {
	for (let i = 0; i < mf_cache_sorted.length; i++) {
		const entry = mf_cache_sorted[i];
		const too_old = entry.age > mf_cache_max_age;

		if (! too_old) {
			entry.score = ((entry.score / 2) | 0) - 1;
		}

		if (too_old || entry.score < 0) {
			delete mf_cache_index[entry.url];
			mf_cache_sorted.splice(i--, 1);
		}
	}
}

/**
 * Tier-two cache clear; Removes the oldest half of entries
 * from the cache regardless of usage stats
 */
function clear_oldest() {
	const half = (mf_cache_sorted.length / 2) | 0;
	const evicted = mf_cache_sorted.splice(0, half);

	for (const entry of evicted) {
		delete mf_cache_index[entry.url];
	}
}
