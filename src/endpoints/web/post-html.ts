
import { web } from '../../http';
import { store } from '../../storage';
import { rendered_post_cache } from '../../cache';
import { throw_404_not_found } from '../../http-error';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { read_as_entry } from '../../external-posts';

const partials = store.templates.page_partials('post_content.html', 'post_meta.html');
const post_cache = rendered_post_cache('post');

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

web.get('/posts/:post_uri_name', opts, async (req: Req, res) => {
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

	const data = store.posts.get_post('post', uri_name);

	if (! data) {
		throw_404_not_found('post not found');
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
	const data = store.posts.get_post('post', uri_name);
	const post = new store.posts.Post(data);

	const mentions_data = await store.mentions.get_live_post_mentions(post.post_type, post.uri_name);
	post.mentions = await Promise.all(
		mentions_data.map(async (data) => {
			const mention = new store.mentions.Mention(data);
			mention.external = await read_as_entry(data.source_url);
			mention.external.context = post;
			return mention;
		})
	);

	const page = {
		page_name: 'post',
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
