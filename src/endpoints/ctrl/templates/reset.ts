
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';

type Req = ReqUser & FastifyRequest<{
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

const resetable_templates = new Set([
	'page.html',
	'feed_head.html',
	'feed_content.html',
	'post_head.html',
	'post_content.html',
	'not_found.html',
	'styles.css',
	'robots.txt',
]);

ctrl.post('/api/templates/:template_name/reset', opts, async (req: Req, res) => {
	require_auth(req);

	const name = req.params.template_name;

	if (! resetable_templates.has(name)) {
		http_error.throw_404_not_found('template not found');
	}

	await store.templates.reset_template(name);

	res.status(204);
});
