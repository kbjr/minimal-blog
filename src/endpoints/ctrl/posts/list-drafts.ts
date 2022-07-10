
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { post_res_schema } from './schema';

type Req = ReqUser & FastifyRequest<{
	Querystring: {
		count: number;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['entries'],
		description: 'Returns a list of draft Entries',
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

ctrl.get('/api/drafts', opts, async (req: Req, res) => {
	require_auth(req);

	const { count } = req.query;
	const raw_posts = store.posts.get_draft_posts(count);

	res.status(200);
	return raw_posts;
});
