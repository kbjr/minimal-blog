
import { store } from '../../storage';
import { rendered_template_cache } from '../../cache';
import { FastifyReply, FastifyRequest } from 'fastify';

let cache: () => Promise<string>;

const partials = Object.freeze({
	get page_head() { return ''; },
	get page_content() {
		return store.templates.get_template('not_found.html');
	}
});

async function get_context() {
	return new store.templates.TemplateContext({
		get title() { return store.settings.get('feed_title'); },
		get url() { return ''; }
	}, [ ]);
}

export async function show_not_found(req: FastifyRequest, res: FastifyReply) {
	if (! cache) {
		cache = rendered_template_cache('page.html', get_context, partials, {
			settings: true,
			templates: true,
			colors: true
		});
	}

	const html = await cache();
	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
}
