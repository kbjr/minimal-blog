
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { require_auth, ReqUser } from '../../../auth';

type Req = ReqUser & FastifyRequest<{ }>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['settings'],
		description: 'Returns all of the current settings',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: {
				type: 'object',
				properties: {
					language: { type: 'string' },
					theme_light: { type: 'string' },
					theme_dark: { type: 'string' },
					feed_title: { type: 'string' },
					author_name: { type: 'string' },
					author_url: { type: 'string' },
					author_avatar: { type: 'string' },
				}
			}
		}
	}
};

ctrl.get('/api/settings', opts, async (req: Req, res) => {
	require_auth(req);
	return store.settings.get_all();
});
