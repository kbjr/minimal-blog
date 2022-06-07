
import { MicroformatRoot, MicroformatProperty } from './parse';

export interface ExternalAuthor {
	author_name?: string;
	author_url?: string;
	author_avatar?: string;
}

export function read_author_from_prop(prop: MicroformatProperty[]) {
	if (prop && prop.length) {
		const prop0 = prop[0];

		if (typeof prop0 === 'string') {
			return { author_name: prop0 };
		}

		if ('properties' in prop0) {
			if (prop0.type.includes('h-card')) {
				return read_author_from_h_card(prop0);
			}

			if (typeof prop0.value === 'string') {
				return { author_name: prop0.value };
			}
		}

		if ('html' in prop0) {
			return { author_name: prop0.value };
		}
	}
}

export function read_author_from_h_card(h_card: MicroformatRoot) {
	const author: ExternalAuthor = {
		author_name: null,
		author_url: null,
		author_avatar: null,
	};

	const { name, nickname, url, photo } = h_card.properties;

	name_check: {
		if (name && name.length) {
			const name0 = name[0];

			if (typeof name0 === 'string') {
				author.author_name = name0;
				break name_check;
			}
	
			// todo: html
		}

		if (nickname && nickname.length) {
			const nickname0 = nickname[0];

			if (typeof nickname0 === 'string') {
				author.author_name = nickname0;
				break name_check;
			}
	
			// todo: html
		}
	}

	if (url && url.length) {
		const url0 = url[0];

		if (typeof url0 === 'string') {
			author.author_url = url0;
		}
	}

	// todo: photo

	return author;
}
