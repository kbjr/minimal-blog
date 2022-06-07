
import { store } from '../storage';
import { MicroformatRoot } from './parse';
import { mf2_extract_str } from './utils';
import { MicroformatProperty } from './parse';
import { url_is_local } from './local';

export interface ExternalInReplyTo {
	title?: string;
	url: string;
	local_post?: store.posts.Post;
}

export function read_in_reply_to_from_prop(prop: MicroformatProperty[]) {
	if (prop && prop.length) {
		const prop0 = prop[0];

		if (typeof prop0 === 'string') {
			const post = {
				title: null,
				url: prop0,
				local_post: null,
			};

			if (url_is_local(prop0)) {
				// todo: local_post
			}

			return post;
		}

		if ('properties' in prop0) {
			if (prop0.type.includes('h-cite')) {
				return read_in_reply_to_from_h_cite(prop0);
			}
		}
	}
}

export function read_in_reply_to_from_h_cite(h_cite: MicroformatRoot) {
	const in_reply_to: ExternalInReplyTo = {
		title: mf2_extract_str(h_cite.properties.name),
		url: mf2_extract_str(h_cite.properties.url),
		local_post: null,
	};

	// todo: local_post

	return in_reply_to;
}
