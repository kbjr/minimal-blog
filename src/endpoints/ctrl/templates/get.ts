
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';
import { editable_templates } from './shared';

type Req = ReqUser & FastifyRequest<{
	Params: {
		template_name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['templates'],
		description: 'Returns all of the user-editable templates',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: { }
		}
	}
};

ctrl.get('/api/templates/:template_name', opts, async (req: Req, res) => {
	require_auth(req);

	const name = req.params.template_name;

	if (! editable_templates.has(name)) {
		http_error.throw_404_not_found('template not found');
	}

	res.type(template_type(name));
	return store.templates.get_template(name);
});

function template_type(name: string) {
	if (name.endsWith('.html')) {
		return 'text/html';
	}

	if (name.endsWith('.css')) {
		return 'text/css';
	}

	return 'text/plain';
}
