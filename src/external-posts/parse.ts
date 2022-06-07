
import { mf2 } from 'microformats-parser';
import { http_get } from '../outbound-http';
import { dict } from '../util';
import { Cache } from '../cache';
import { html_to_dom } from './utils';
import { parse_meta_tags } from './meta-tags';
import { parse_open_graph } from './open-graph';
import { conf } from '../conf';

const ext_url_cache = new Cache<ParseResult>(
	conf.data.caches.external_url.max_size,
	conf.data.caches.external_url.max_age,
	conf.data.caches.external_url.cycle_count,
);

// Why these types aren't just exported from the library, I have no idea...
export type ParsedDocument = ReturnType<typeof parse_microformats>;
export type MicroformatRoot = ParsedDocument['items'][number];
export type MicroformatProperties = MicroformatRoot['properties'];
export type MicroformatProperty = MicroformatProperties[string][number];

const active_requests: Record<string, Promise<Readonly<ParseResult>>> = dict();

export interface ParseResult {
	url: string;
	title: string;
	meta: Record<string, string | string[]>;
	open_graph: Record<string, string | string[]>;
	microformats: ParsedDocument;
}

export async function parse_url_response(url: string, skip_cache: boolean) : Promise<Readonly<ParseResult>> {
	if (! skip_cache) {
		const cached = ext_url_cache.get_from_cache(url);

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

	// todo: When storing to cache, we can pass another parameter here to
	//   override the max age of the cache entry. We should allow records
	//   to live longer in cache if the server on the other side agrees.
	ext_url_cache.store_to_cache(url, result);
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
