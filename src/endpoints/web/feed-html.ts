
import { web } from '../../http';
import { conf } from '../../conf';
import { store } from '../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { rendered_template_cache } from '../../cache';

const default_count = 10;

const partials = Object.freeze({
	get page_head() {
		return store.templates.get_template('feed_head.html');
	},
	get page_content() {
		return store.templates.get_template('feed_content.html');
	}
});

async function get_default_context() {
	const posts = await store.posts.get_posts(default_count, null, null, false);
	const context = new store.templates.TemplateContext(page_context(default_count), posts.map((post) => new store.posts.Post(post)));
	return context;
}

const cached_page = rendered_template_cache('page.html', get_default_context, partials, {
	settings: true,
	templates: true,
	colors: true
});

type Req = FastifyRequest<{
	Params: {
		tag?: string;
	};
	Querystring: {
		count?: number;
		before?: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		querystring: {
			count: {
				type: 'integer',
				minimum: 1,
				maximum: 25,
				default: default_count,
			},
			before: {
				type: 'string',
				format: 'date-time',
			},
		}
	}
};

web.get('/', opts, async (req: Req, res) => {
	const count = req.query.count ? req.query.count : default_count;
	const html = (! req.query.before && count === default_count)
		? await cached_page()
		: await build_feed_html(count, null, req.query.before);

	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
});

web.get('/tagged/:tag', opts, async (req: Req, res) => {
	const count = req.query.count ? req.query.count : default_count;
	const html = await build_feed_html(count, req.params.tag, req.query.before);

	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
});

async function build_feed_html(count: number, tagged_with?: string, before?: string) {
	const posts = await store.posts.get_posts(count, tagged_with, before, false);
	return build_html_for_posts(posts, count, tagged_with, before);
}

function page_url(count: number, tagged_with?: string, before?: string) {
	let url = `${conf.http.web_url}/${tagged_with ? `tagged/${tagged_with}/` : ''}`;

	if (before) {
		url += `?before=${before}`;

		if (count !== default_count) {
			url += `&count=${count}`;
		}
	}

	else if (count !== default_count) {
		url += `?count=${count}`;
	}

	return url;
}

function page_context(count: number, tagged_with?: string, before?: string) {
	return {
		get title() {
			// TODO: More flexibility here
			return store.settings.get('feed_title');
		},
		get url() {
			return page_url(count);
		}
	};
}

function build_html_for_posts(posts: store.posts.PostData[], count: number, tagged_with?: string, before?: string) {
	const context = new store.templates.TemplateContext(page_context(count, tagged_with, before), posts);
	return store.templates.render('page.html', context, partials);
}
