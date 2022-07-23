
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';
import { parse } from 'mustache';
import { editable_templates } from './shared';

type Req = ReqUser & FastifyRequest<{
	Body: string;
	Params: {
		template_name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['templates'],
		description: 'Updates the contents of the specified template',
		security: [
			{ bearer: [ ] }
		],
		response: {
			204: { }
		}
	}
};

ctrl.put('/api/templates/:template_name', opts, async (req: Req, res) => {
	require_auth(req);

	const name = req.params.template_name;

	if (! editable_templates.has(name)) {
		http_error.throw_404_not_found('template not found');
	}

	try {
		parse(req.body);
	}

	catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to parse template';
		http_error.throw_422_unprocessable_entity(message);
	}

	await store.templates.update_template(name, req.body);
	res.status(204);
});
