
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';
import { PostDataPatch } from '../../../storage/posts';
import { post_res_schema, patch_update_req_schema } from './schema';
import { conf } from '../../../conf';
import { str, str_enum } from '../../../json-schema';

type Req = ReqUser & FastifyRequest<{
	Body: PostDataPatch;
	Params: {
		post_type: store.posts.PostType;
		uri_name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['entries'],
		description: 'Updates an existing entry',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: post_res_schema
		},
		body: patch_update_req_schema,
		params: {
			type: 'object',
			properties: {
				post_type: str_enum(store.posts.post_types()),
				uri_name: str()
			}
		}
	}
};

ctrl.patch('/api/posts/:post_type/:uri_name', opts, async (req: Req, res) => {
	require_auth(req);

	const data = await store.posts.update_post(req.params.post_type, req.params.uri_name, req.body);
	const post = new store.posts.Post(data);

	res.status(200);
	return post;
});
