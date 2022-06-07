
import { ctrl } from '../../../http';
import { store } from '../../../storage';
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

const putable_templates = new Set([
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
	'mention_card.html',
	'mention_thread.html',
	'styles.css',
	'robots.txt',
	'svg_icon.js',
]);

ctrl.put('/api/templates/:template_name', opts, async (req: Req, res) => {
	require_auth(req);

	const name = req.params.template_name;

	if (! putable_templates.has(name)) {
		http_error.throw_404_not_found('template not found');
	}

	await store.templates.update_template(name, req.body);

	res.status(204);
});
