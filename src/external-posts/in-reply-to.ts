
import { store } from '../storage';
import { MicroformatRoot } from './parse';
import { mf2_extract_str } from './utils';
import { MicroformatProperty } from './parse';
import { ParsedLocalUrl, parse_local_url, url_is_local } from './local';

export interface ExternalInReplyTo {
	url: string;
	title?: string;
	local?: ParsedLocalUrl;
}

export function read_in_reply_to_from_prop(prop: MicroformatProperty[]) {
	if (! prop) {
		return;
	}

	return prop.map((value) => {
		if (typeof value === 'string') {
			const post: ExternalInReplyTo = {
				url: value,
				title: null,
				local: null,
			};

			if (url_is_local(value)) {
				post.local = parse_local_url(value);
			}

			return post;
		}

		if ('properties' in value) {
			if (value.type.includes('h-cite')) {
				return read_in_reply_to_from_h_cite(value);
			}
		}
	});
}

export function read_in_reply_to_from_h_cite(h_cite: MicroformatRoot) {
	const in_reply_to: ExternalInReplyTo = {
		url: mf2_extract_str(h_cite.properties.url),
		title: mf2_extract_str(h_cite.properties.name),
		local: null,
	};

	if (url_is_local(in_reply_to.url)) {
		in_reply_to.local = parse_local_url(in_reply_to.url);
	}

	return in_reply_to;
}
