
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

type Req = ReqUser & FastifyRequest<{ }>;

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						name: { type: 'string' },
						is_admin: { type: 'boolean' }
					}
				}
			}
		}
	}
};

ctrl.get('/api/users', opts, async (req: Req, res) => {
	require_auth(req);
	return store.users.all_users;
});
