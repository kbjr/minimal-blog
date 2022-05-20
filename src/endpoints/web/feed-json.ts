
import { RouteShorthandOptions } from 'fastify';
import { conf } from '../../conf';
import { web } from '../../http';
import { store } from '../../storage';

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			200: {
				type: 'object',
				properties: {
					version: { type: 'string' },
					title: { type: 'string' },
					home_page_url: { type: 'string' },
					feed_url: { type: 'string' },
					// description: { type: 'string' },
					// user_comment: { type: 'string' },
					// next_url: { type: 'string' },
					// icon: { type: 'object' },
					// favicon: { type: 'object' },
					authors: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								name: { type: 'string' },
								url: { type: 'string' },
								avatar: { type: 'string' },
							}
						}
					},
					language: { type: 'string' },
					expired: { type: 'boolean' },
					// hubs: { type: 'array' },
					// items: { type: 'array' },
				}
			}
		}
	}
};

web.get('/feed.json', opts, async (req, res) => {
	res.type('application/feed+json; charset=utf-8');
	res.header('content-language', store.settings.get('language'));

	// TODO: build json feed
	return {
		version: 'https://jsonfeed.org/version/1.1',
		title: store.settings.get('feed_title'),
		home_page_url: conf.http.web_url,
		feed_url: `${conf.http.web_url}/feed.json`,
		// description: '',
		// user_comment: '',
		// next_url: '',
		// icon: { },
		// favicon: { },
		authors: [{
			name: store.settings.get('author_name'),
			url: store.settings.get('author_url'),
			avatar: store.settings.get('author_avatar'),
		}],
		language: store.settings.get('language'),
		// expired: false,
		// hubs: [ ],
		// items: [ ],
	};
});
