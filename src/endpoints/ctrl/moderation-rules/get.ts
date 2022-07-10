
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { require_auth, ReqUser } from '../../../auth';
import { rules_schema } from './schema';

type Req = ReqUser & FastifyRequest<{ }>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['settings'],
		description: 'Returns all of the current mention moderation rules',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: rules_schema
		}
	}
};

ctrl.get('/api/moderation_rules', opts, async (req: Req, res) => {
	require_auth(req);
	return store.moderation_rules.get_rules();
});
