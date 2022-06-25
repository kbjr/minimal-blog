
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { get_theme_res_body } from './schema';

type Req = ReqUser & FastifyRequest<{ }>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['themes'],
		description: 'Returns a list of all existing Color Themes',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: get_theme_res_body
		}
	}
};

ctrl.get('/api/themes', opts, async (req: Req, res) => {
	require_auth(req);
	return store.colors.get_all();
});
