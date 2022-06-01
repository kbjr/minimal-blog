
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { require_auth, ReqUser } from '../../../auth';
import { links_schema } from './schema';

type Req = ReqUser & FastifyRequest<{ }>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['links'],
		description: 'Returns all of the current links',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: links_schema
		}
	}
};

ctrl.get('/api/links', opts, async (req: Req, res) => {
	require_auth(req);
	return store.links.get_links();
});
