
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { require_auth, ReqUser } from '../../../auth';
import { mentions_schema } from './schema';

type Req = ReqUser & FastifyRequest<{ }>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['mentions'],
		description: 'Returns a list of mentions currently waiting on automated verification',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: mentions_schema
		}
	}
};

ctrl.get('/api/mentions/verification_queue', opts, async (req: Req, res) => {
	require_auth(req);
	// todo: make these querystring params
	return store.mentions.get_mentions_needing_verification(50, 0);
});
