
import { ctrl } from '../../../http';
import { store, TemplateName } from '../../../storage';
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
		response: {
			200: { }
		}
	}
};

const getable_templates = new Set([
	TemplateName.page_html,
	TemplateName.feed_head_html,
	TemplateName.feed_content_html,
	TemplateName.post_head_html,
	TemplateName.post_content_html,
	TemplateName.not_found_html,
	TemplateName.styles_css,
	TemplateName.robots_txt,
]);

ctrl.get('/api/templates/:template_name', opts, async (req: Req, res) => {
	require_auth(req);

	const name = req.params.template_name as TemplateName;

	if (! getable_templates.has(name)) {
		http_error.throw_404_not_found('template not found');
	}

	res.type(template_type(name));
	return store.templates.get_template(name);
});

function template_type(name: TemplateName) {
	if (name.endsWith('.html')) {
		return 'text/html';
	}

	if (name.endsWith('.css')) {
		return 'text/css';
	}

	return 'text/plain';
}
