
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
		description: 'Resets the contents of the specified template back to the default',
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
	'feed_content.html',
	'post_card.html',
	'post_content.html',
	'comment_card.html',
	'comment_content.html',
	'note_card.html',
	'note_content.html',
	'event_card.html',
	'event_content.html',
	'rsvp_card.html',
	'rsvp_content.html',
	'not_found.html',
	'author_card.html',
	'styles.css',
	'robots.txt',
	'svg_icon.js',
]);

ctrl.delete('/api/templates/:template_name', opts, async (req: Req, res) => {
	require_auth(req);

	const name = req.params.template_name;

	if (! resetable_templates.has(name)) {
		http_error.throw_404_not_found('template not found');
	}

	await store.templates.reset_template(name);

	res.status(204);
});
