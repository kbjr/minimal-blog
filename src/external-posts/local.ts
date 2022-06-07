
import { conf } from '../conf';
import { store } from '../storage';

const post_pattern = /^\/(posts|comments|notes|events|rsvps)\/([^/]+)(?:\/(mentions))?/;

export function url_is_local(url: string) : url is `${typeof conf.http.web_url}${'' | `/${string}`}` {
	return url === conf.http.web_url || url.startsWith(conf.http.web_url + '/');
}

export function parse_local_url(url: string) {
	const path = url.slice(conf.http.web_url.length);

	if (path === '/') {
		return { type: 'feed' as const };
	}

	if (path === '/search') {
		return { type: 'search' as const };
	}

	const match = post_pattern.exec(path);

	if (! match) {
		return { type: 'other' as const };
	}

	const [ , type, uri_name, mentions ] = match;
	const post_type = type.slice(0, -1) as store.posts.PostType;

	if (mentions) {
		return { type: 'mentions' as const, post_type, uri_name };
	}

	return { type: 'post' as const, post_type, uri_name };
}
