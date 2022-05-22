
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { post_res_schema } from './schema';
import { throw_404_not_found } from '../../../http-error';

type Req = ReqUser & FastifyRequest<{
	Params: {
		uri_name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['posts'],
		description: 'Returns the post with the given URI',
		security: [
			{ bearer: [ ] }
		],
		params: {
			type: 'object',
			properties: {
				uri_name: { type: 'string' }
			}
		},
		response: {
			200: post_res_schema,
		}
	}
};

ctrl.get('/api/posts/:uri_name', opts, async (req: Req, res) => {
	require_auth(req);

	const post = await store.posts.get_post('post', req.params.uri_name);

	if (! post) {
		throw_404_not_found('Post not found');
	}

	res.status(200);
	return post;
});
