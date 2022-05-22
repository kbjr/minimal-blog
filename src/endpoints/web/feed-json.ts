
import { conf } from '../../conf';
import { web } from '../../http';
import { store } from '../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { PostData } from '../../storage/posts';
import { JSONFeed } from '../../json-feed';

type Req = FastifyRequest<{
	Querystring: {
		count: number;
		tagged_with?: string;
		before?: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		querystring: {
			type: 'object',
			properties: {
				count: {
					type: 'integer',
					minimum: 1,
					maximum: 25,
					default: 10,
				},
				before: {
					type: 'string',
					format: 'date-time',
				},
				tagged: {
					type: 'string'
				}
			}
		},
		response: {
			200: {
				type: 'object',
				properties: {
					version: { type: 'string' },
					title: { type: 'string' },
					home_page_url: { type: 'string' },
					feed_url: { type: 'string' },
					description: { type: 'string' },
					user_comment: { type: 'string' },
					next_url: { type: 'string' },
					icon: { type: 'string' },
					favicon: { type: 'string' },
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
					hubs: { type: 'array' },
					items: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: { type: 'string', format: 'uri' },
								url: { type: 'string', format: 'uri' },
								external_url: { type: 'string', format: 'uri' },
								title: { type: 'string' },
								content_html: { type: 'string' },
								content_text: { type: 'string' },
								image: { type: 'string', format: 'uri' },
								banner_image: { type: 'string', format: 'uri' },
								date_published: { type: 'string', format: 'date-time' },
								date_modified: { type: 'string', format: 'date-time' },
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
								tags: {
									type: 'array',
									items: { type: 'string' }
								},
								language: { type: 'string' },
								attachments: { type: 'array' },
							}
						}
					},
				}
			}
		}
	}
};

web.get('/feed.json', opts, async (req: Req, res) => {
	res.type('application/feed+json; charset=utf-8');
	res.header('content-language', store.settings.get('language'));

	const lang = store.settings.get('language');
	const author = {
		name: store.settings.get('author_name'),
		url: store.settings.get('author_url'),
		avatar: store.settings.get('author_avatar'),
	};

	const posts = await store.posts.get_posts(req.query.count, req.query.tagged_with, req.query.before, false);
	const result: JSONFeed = {
		version: 'https://jsonfeed.org/version/1.1',
		title: store.settings.get('feed_title'),
		home_page_url: conf.http.web_url,
		feed_url: `${conf.http.web_url}/feed.json`,
		description: store.settings.get('feed_description'),
		// user_comment: '',
		next_url: next_url(req.query, posts),
		// icon: '',
		favicon: `${conf.http.web_url}/favicon`,
		authors: [ author ],
		language: lang,
		expired: false,
		hubs: [ ],
		items: posts.map((post) => {
			const url = `${conf.http.web_url}/posts/${post.uri_name}`;

			return {
				id: url,
				url: url,
				external_url: post.external_url,
				title: post.title,
				content_html: post.content_html,
				content_text: post.content_markdown,
				image: post.image,
				banner_image: post.banner_image,
				date_published: post.date_published,
				date_modified: post.date_updated,
				authors: [ author ],
				tags: post.tags || [ ],
				language: lang,
				attachments: [ ]
			};
		}),
	};

	res.status(200);
	return result;
});

function next_url(query: Req['query'], posts: PostData[]) {
	// If we didn't find enough posts for this page, assume that means
	// there are no more and we shouldn't return a next link
	if (posts.length < query.count) {
		return null;
	}

	const base = `${conf.http.web_url}/feed.json`;
	const params: string[] = [ ];

	if (query.count) {
		params.push(`count=${query.count}`);
	}

	if (query.tagged_with) {
		params.push(`tagged_with=${query.tagged_with}`);
	}

	const oldest = posts[posts.length - 1];
	params.push(`before=${oldest.date_published}`);

	return `${base}?${params.join('&')}`;
}
