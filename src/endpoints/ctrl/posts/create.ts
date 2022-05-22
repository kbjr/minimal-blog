
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
		tags: ['posts'],
		description: 'Creates a new post',
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

	Object.assign(req.body, {
		post_type: 'post',
	})

	const post = await store.posts.create_post(req.body);

	res.status(201);
	res.header('location', `${conf.http.ctrl_url}/api/posts/${post.uri_name}`);
	return post;
});
