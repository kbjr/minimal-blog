
import { ctrl } from '../../http';
import { render_markdown_to_html } from '../../markdown';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { require_auth, ReqUser } from '../../auth';

type Req = ReqUser & FastifyRequest<{
	Body: string;
}>;

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			200: { }
		}
	}
};

ctrl.post('/api/preview-markdown', opts, async (req: Req, res) => {
	require_auth(req, false);

	const html = await render_markdown_to_html(req.body);

	res.status(200);
	res.type('text/html');
	return html;
});
