
import { ctrl } from '../../http';
import { render_markdown_to_html } from '../../markdown';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { require_auth, ReqUser } from '../../auth';

type Req = ReqUser & FastifyRequest<{
	Body: string;
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['entries'],
		description: 'Endpoint responsible for rendering previews of markdown content while authoring Entries',
		security: [
			{ bearer: [ ] }
		],
		body: { type: 'string' },
		response: {
			200: { type: 'string' }
		}
	}
};

ctrl.post('/api/preview-markdown', opts, async (req: Req, res) => {
	require_auth(req);

	const html = await render_markdown_to_html(req.body);

	res.status(200);
	res.type('text/html; charset=utf-8');
	return html;
});
