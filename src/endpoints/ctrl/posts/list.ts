
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { post_res_schema } from './schema';

type Req = ReqUser & FastifyRequest<{
	Querystring: {
		count: number;
		tagged_with?: string;
		before?: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['entries'],
		description: 'Returns a list of Entries, filtered by the given parameters',
		security: [
			{ bearer: [ ] }
		],
		querystring: {
			type: 'object',
			properties: {
				count: {
					type: 'integer',
					minimum: 1,
					maximum: 50,
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
				type: 'array',
				items: post_res_schema,
			}
		}
	}
};

// fixme: rename "entries"
ctrl.get('/api/posts', opts, async (req: Req, res) => {
	require_auth(req);

	const { count, tagged_with, before } = req.query;
	const raw_posts = store.posts.get_posts(count, tagged_with, before);

	res.status(200);
	return raw_posts;
});
