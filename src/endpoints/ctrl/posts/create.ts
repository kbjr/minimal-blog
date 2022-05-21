
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';
import { PostDataPatch } from '../../../storage/posts';
import { post_res_schema } from './get.schema';
import { post_create_req_schema } from './create.schema';

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
	res.status(201);
	return req.body;
});
