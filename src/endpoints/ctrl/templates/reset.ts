
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
		description: 'Resets the contents of the specified template back to the default',
		security: [
			{ bearer: [ ] }
		],
		response: {
			204: { }
		}
	}
};

ctrl.delete('/api/templates/:template_name', opts, async (req: Req, res) => {
	require_auth(req);

	const name = req.params.template_name;

	if (! editable_templates.has(name)) {
		http_error.throw_404_not_found('template not found');
	}

	await store.templates.reset_template(name);

	res.status(204);
});
