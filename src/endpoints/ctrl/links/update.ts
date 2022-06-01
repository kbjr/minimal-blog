
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { links_schema } from './schema';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

type Req = ReqUser & FastifyRequest<{
	Body: store.links.LinkData[];
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['links'],
		description: 'Updates the sidebar links',
		security: [
			{ bearer: [ ] }
		],
		response: {
			204: { }
		},
		body: links_schema
	}
};

ctrl.put('/api/links', opts, async (req: Req, res) => {
	require_auth(req);
	await store.links.set_links(req.body);
	res.status(204);
});
