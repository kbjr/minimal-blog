
import { ctrl } from '../../../http';
import { store, TemplateName } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';

type Req = ReqUser & FastifyRequest<{
	Body: string;
	Params: {
		template_name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			204: { }
		}
	}
};

const putable_templates = new Set([
	TemplateName.page_html,
	TemplateName.feed_head_html,
	TemplateName.feed_content_html,
	TemplateName.post_head_html,
	TemplateName.post_content_html,
	TemplateName.not_found_html,
	TemplateName.styles_css,
	TemplateName.robots_txt,
]);

ctrl.put('/api/templates/:template_name', opts, async (req: Req, res) => {
	require_auth(req);

	const name = req.params.template_name as TemplateName;

	if (! putable_templates.has(name)) {
		http_error.throw_404_not_found('template not found');
	}

	await store.templates.update_template(name, req.body);

	res.status(204);
});
