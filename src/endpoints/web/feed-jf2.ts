
import { conf } from '../../conf';
import { web } from '../../http';
import { store } from '../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { JF2Card, JF2Entry, JF2Feed, jf2_feed_schema } from '../../jf2';

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
			200: jf2_feed_schema
		}
	}
};

web.get('/jf2-feed.json', opts, async (req: Req, res) => {
	res.type('application/jf2feed+json; charset=utf-8');
	res.header('content-language', store.settings.get('language'));

	const lang = store.settings.get('language');
	const author: JF2Card = {
		type: 'card',
		name: store.settings.get('author_name'),
		url: store.settings.get('author_url'),
		photo: store.settings.get('author_avatar'),
	};

	const post_data = await store.posts.get_posts(req.query.count, req.query.tagged_with, req.query.before, null, false);
	const posts = post_data.map((data) => new store.posts.Post(data));

	const result: JF2Feed = {
		type: 'feed',
		name: store.settings.get('feed_title'),
		url: conf.http.web_url,
		summary: store.settings.get('feed_description'),
		// photo: '',
		author,
		lang,
		children: posts.map((post) => {
			const entry: JF2Entry = {
				type: 'entry',
				uid: post.post_url,
				url: post.post_url,
				name: post.title,
				'in-reply-to': post.external_url,
				content: {
					html: post.content_html,
					text: post.content_markdown,
				},
				photo: post.image,
				featured: post.banner_image,
				published: post.date_published_iso,
				updated: post.date_updated_iso,
				author: author,
				category: post.tags || [ ],
				lang,
				// video
				// audio
				// references
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
					// Note: non-standard event fields on entry
					entry.start = post.date_event_start_iso;
					entry.end = post.date_event_end_iso;
					break;
					
					case 'rsvp':
					// Note: non-standard rsvp fields on entry
					entry.rsvp = post.rsvp_type;
					break;
			}

			return entry;
		}),
	};

	res.status(200);
	return result;
});
