
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { str, str_enum, obj } from '../../../json-schema';

type Req = ReqUser & FastifyRequest<{
	Params: {
		post_type: store.posts.PostType;
		uri_name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['entries'],
		description: 'Delete an entry',
		security: [
			{ bearer: [ ] }
		],
		response: {
			204: { }
		},
		params: obj({
			post_type: str_enum(store.posts.post_types()),
			uri_name: str()
		})
	}
};

ctrl.delete('/api/posts/:post_type/:uri_name', opts, async (req: Req, res) => {
	require_auth(req);
	await store.posts.delete_post(req.params.post_type, req.params.uri_name);
	res.status(204);
});
