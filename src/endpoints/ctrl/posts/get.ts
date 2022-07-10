
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { post_res_schema } from './schema';
import { throw_404_not_found } from '../../../http-error';
import { str, str_enum } from '../../../json-schema';

type Req = ReqUser & FastifyRequest<{
	Params: {
		uri_name: string;
		post_type: store.posts.PostType;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['entries'],
		description: 'Returns the entry with the given URI',
		security: [
			{ bearer: [ ] }
		],
		params: {
			type: 'object',
			properties: {
				uri_name: str(),
				post_type: str_enum(store.posts.post_types()),
			}
		},
		response: {
			200: post_res_schema,
		}
	}
};

ctrl.get('/api/posts/:post_type/:uri_name', opts, async (req: Req, res) => {
	require_auth(req);

	const post = store.posts.get_post(req.params.post_type, req.params.uri_name);

	if (! post) {
		throw_404_not_found('Post not found');
	}

	res.status(200);
	return post;
});
