
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { create_theme_req_body, create_theme_res_body } from './schema';
import * as http_error from '../../../http-error';

type Req = ReqUser & FastifyRequest<{
	Body: {
		base_name?: string;
		theme_name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['themes'],
		description: 'Creates a new Color Theme, optionally starting with another Theme as a base',
		security: [
			{ bearer: [ ] }
		],
		response: {
			201: create_theme_res_body
		},
		body: create_theme_req_body
	}
};

ctrl.post('/api/themes', opts, async (req: Req, res) => {
	require_auth(req);

	const { base_name, theme_name } = req.body;

	if (store.colors.exists(theme_name)) {
		http_error.throw_422_unprocessable_entity('Given theme name already exists');
	}

	if (base_name && ! store.colors.exists(base_name)) {
		http_error.throw_422_unprocessable_entity('Given base theme name does not exist');
	}

	await store.colors.create_theme(theme_name, base_name);
	const theme = store.colors.get(theme_name);

	res.status(201);
	return theme;
});
