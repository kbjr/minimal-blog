
import { web } from '../../http';
import { dict } from '../../util';
import { store } from '../../storage';
import { throw_404_not_found } from '../../http-error';
import { rendered_template_cache } from '../../cache';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

const partials = store.templates.page_partials('event_content.html');
const cached_posts = dict<string, () => Promise<string>>();

type Req = FastifyRequest<{
	Params: {
		post_uri_name?: string;
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
	if (! cached_posts[uri_name]) {
		const data = await store.posts.get_post('event', uri_name);

		if (! data) {
			throw_404_not_found('Event not found');
		}

		cached_posts[uri_name] = rendered_template_cache('page.html', get_context(uri_name), partials, {
			settings: true,
			templates: true,
			colors: true,
			feed: true,
			posts: true,
			links: true,
		});
	}

	return cached_posts[uri_name]();
}

function get_context(uri_name: string) {
	return async function() {
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
}
