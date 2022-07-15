
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { require_auth, ReqUser } from '../../../auth';
import { mentions_schema } from './schema';

type Req = ReqUser & FastifyRequest<{ }>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['mentions'],
		description: 'Returns a list of mentions currently waiting on approval',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: mentions_schema
		}
	}
};

ctrl.get('/api/mentions/moderation_queue', opts, async (req: Req, res) => {
	require_auth(req);
	// todo: make these querystring params
	return store.mentions.get_mentions_needing_moderation(50, 0);
});
