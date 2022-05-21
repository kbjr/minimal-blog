
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { require_auth, ReqUser } from '../../../auth';
import { settings_schema } from './schema';

type Req = ReqUser & FastifyRequest<{ }>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['settings'],
		description: 'Returns all of the current settings',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: settings_schema
		}
	}
};

ctrl.get('/api/settings', opts, async (req: Req, res) => {
	require_auth(req);
	return store.settings.get_all();
});
