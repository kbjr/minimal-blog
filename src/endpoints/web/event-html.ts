
import { web } from '../../http';
import { store } from '../../storage';
import { rendered_post_cache } from '../../cache';
import { throw_404_not_found } from '../../http-error';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

const partials = store.templates.page_partials('event_content.html', 'event_meta.html');
const post_cache = rendered_post_cache('event');

type Req = FastifyRequest<{
	Params: {
		post_uri_name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		params: {
			type: 'object',
			properties: {
				post_uri_name: { type: 'string' }
			}
		}
	}
};

web.get('/events/:post_uri_name', opts, async (req: Req, res) => {
	const html = await get_post_html(req.params.post_uri_name);

	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
});

async function get_post_html(uri_name: string) {
	const cached = post_cache.get_from_cache(uri_name);

	if (cached) {
		return cached;
	}

	const data = await store.posts.get_post('event', uri_name);

	if (! data) {
		throw_404_not_found('event not found');
	}

	const html = render_template(uri_name);
	post_cache.store_to_cache(uri_name, html);
	return html;
}

async function render_template(uri_name: string) {
	const context = await create_context(uri_name);
	return store.templates.render('page.html', context, partials);
}

async function create_context(uri_name: string) {
	const data = await store.posts.get_post('event', uri_name);
	const post = new store.posts.Post(data);

	const page = {
		page_name: 'event',
		get title() {
			return post.title;
		},
		get url() {
			return post.post_url;
		},
		get description() {
			return post.subtitle;
		}
	};

	return new store.templates.TemplateContext(page, null, post);
}
