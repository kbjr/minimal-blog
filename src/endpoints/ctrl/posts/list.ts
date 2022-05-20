
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

type Req = ReqUser & FastifyRequest<{
	Querystring: {
		count: number;
		tagged_with?: string;
		before?: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['posts'],
		description: 'Returns a list of Posts, filtered by the given parameters',
		security: [
			{ bearer: [ ] }
		],
		querystring: {
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
		},
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					additionalProperties: true,
				},
			}
		}
	}
};

ctrl.get('/api/posts', opts, async (req: Req, res) => {
	require_auth(req);

	const { count, tagged_with, before } = req.query;
	const raw_posts = store.posts.get_posts(count, tagged_with, before);

	return raw_posts;
});
