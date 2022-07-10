
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';
import { PostDataPatch } from '../../../storage/posts';
import { post_res_schema, post_create_req_schema } from './schema';
import { conf } from '../../../conf';

type Req = ReqUser & FastifyRequest<{
	Body: PostDataPatch;
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['entries'],
		description: 'Creates a new entry',
		security: [
			{ bearer: [ ] }
		],
		response: {
			201: post_res_schema
		},
		body: post_create_req_schema
	}
};

ctrl.post('/api/posts', opts, async (req: Req, res) => {
	require_auth(req);

	const data = await store.posts.create_post(req.body);
	const post = new store.posts.Post(data);

	res.status(201);
	res.header('location', post.post_url);
	return post;
});
