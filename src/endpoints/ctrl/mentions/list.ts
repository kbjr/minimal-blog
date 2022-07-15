
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { mentions_schema } from './schema';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

type Req = ReqUser & FastifyRequest<{ }>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['mentions'],
		description: 'Returns a list of mentions that have been received from other sites',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: mentions_schema
		}
	}
};

ctrl.get('/api/mentions', opts, async (req: Req, res) => {
	require_auth(req);
	// todo: make these querystring params
	return store.mentions.get_mentions(50, 0);
});
