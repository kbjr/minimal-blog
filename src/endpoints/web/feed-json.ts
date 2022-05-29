
import { conf } from '../../conf';
import { web } from '../../http';
import { store } from '../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import {
	JSONFeed, JSONFeedItem, JSONFeedItem_EventExtention, JSONFeedItem_RsvpExtention,
	json_feed_event_schema_url, json_feed_rsvp_schema_url, json_feed_schema_url,
	json_feed_schema
} from '../../json-feed';

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
			200: json_feed_schema
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

	const post_data = await store.posts.get_posts(req.query.count, req.query.tagged_with, req.query.before, null, false);
	const posts = post_data.map((data) => new store.posts.Post(data));

	const result: JSONFeed = {
		version: json_feed_schema_url,
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
			const item: JSONFeedItem & JSONFeedItem_EventExtention & JSONFeedItem_RsvpExtention = {
				id: post.post_url,
				url: post.post_url,
				external_url: post.external_url,
				title: post.title,
				content_html: post.content_html,
				content_text: post.content_markdown,
				image: post.image,
				banner_image: post.banner_image,
				date_published: post.date_published_iso,
				date_modified: post.date_updated_iso,
				authors: [ author ],
				tags: post.tags || [ ],
				language: lang,
				attachments: [ ]
			};

			switch (post.post_type) {
				case 'post':
					// pass
					break;
				
				case 'comment':
					// pass
					break;
				
				case 'note':
					// pass
					break;
				
				case 'event':
					item._event = {
						$schema: json_feed_event_schema_url,
						date_start: post.date_event_start_iso,
						date_end: post.date_event_end_iso,
					};
					break;
				
				case 'rsvp':
					item._rsvp = {
						$schema: json_feed_rsvp_schema_url,
						rsvp: post.rsvp_type,
					};
					break;
			}

			return item;
		}),
	};

	res.status(200);
	return result;
});

function next_url(query: Req['query'], posts: store.posts.Post[]) {
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
	params.push(`before=${oldest.date_published_iso}`);

	return `${base}?${params.join('&')}`;
}
