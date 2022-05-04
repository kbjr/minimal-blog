
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { require_auth, ReqUser } from '../../../auth';

type Req = ReqUser & FastifyRequest<{ }>;

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			200: {
				type: 'object',
				properties: {
					version: { type: 'number' },
					language: { type: 'string' },
					theme_light: { type: 'string' },
					theme_dark: { type: 'string' },
					feed_title: { type: 'string' },
					show_setup: {
						type: 'number',
						enum: [ 0, 1 ]
					}
				}
			}
		}
	}
};

ctrl.get('/api/settings', opts, async (req: Req, res) => {
	require_auth(req);
	return store.settings.get_all();
});
