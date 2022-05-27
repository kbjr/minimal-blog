
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
		description: 'Returns all of the user-editable templates',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: { }
		}
	}
};

const getable_templates = new Set([
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

ctrl.get('/api/templates/:template_name', opts, async (req: Req, res) => {
	require_auth(req);

	const name = req.params.template_name;

	if (! getable_templates.has(name)) {
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
