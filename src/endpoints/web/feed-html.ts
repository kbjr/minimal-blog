
import { web } from '../../http';
import { conf } from '../../conf';
import { store } from '../../storage';
import { rendered_template_cache } from '../../cache';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { posts } from '../../storage/store';

const default_count = 10;

const partials = store.templates.page_partials('feed_content.html');

async function get_default_context() {
	const data = await store.posts.get_posts(default_count, null, null, null, false);
	const posts = data.map((post) => new store.posts.Post(post));
	const context = new store.templates.TemplateContext(page_context(default_count, null, null, null, posts), posts);
	return context;
}

const cached_page = rendered_template_cache('page.html', get_default_context, partials, {
	settings: true,
	templates: true,
	colors: true,
	feed: true,
	posts: true,
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
		: await build_feed_html(count, null, req.query.before, null);

	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
});

web.get('/tagged/:tag', opts, async (req: Req, res) => {
	const count = req.query.count ? req.query.count : default_count;
	const html = await build_feed_html(count, req.params.tag, req.query.before, null);

	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
});

web.get('/posts', opts, async (req: Req, res) => {
	const count = req.query.count ? req.query.count : default_count;
	const html = await build_feed_html(count, null, req.query.before, 'post');

	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
});

web.get('/comments', opts, async (req: Req, res) => {
	const count = req.query.count ? req.query.count : default_count;
	const html = await build_feed_html(count, null, req.query.before, 'comment');

	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
});

web.get('/notes', opts, async (req: Req, res) => {
	const count = req.query.count ? req.query.count : default_count;
	const html = await build_feed_html(count, null, req.query.before, 'note');

	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
});

web.get('/events', opts, async (req: Req, res) => {
	const count = req.query.count ? req.query.count : default_count;
	const html = await build_feed_html(count, null, req.query.before, 'event');

	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
});

web.get('/rsvps', opts, async (req: Req, res) => {
	const count = req.query.count ? req.query.count : default_count;
	const html = await build_feed_html(count, null, req.query.before, 'rsvp');

	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
});

async function build_feed_html(count: number, tagged_with?: string, before?: string, post_type?: posts.PostType) {
	const posts = await store.posts.get_posts(count, tagged_with, before, post_type, false);
	return build_html_for_posts(posts.map((post) => new store.posts.Post(post)), count, tagged_with, before, post_type);
}

function page_url(count: number, tagged_with?: string, before?: string, post_type?: posts.PostType) {
	let url = conf.http.web_url;

	if (tagged_with) {
		url += `/tagged/${tagged_with}`;
	}

	else if (post_type) {
		url += `/${post_type}s`
	}

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

function next_url(count: number, tagged_with: string, post_type: posts.PostType, posts: store.posts.Post[]) {
	// If we didn't find enough posts for this page, assume that means
	// there are no more and we shouldn't return a next link
	if (posts.length < count) {
		return null;
	}

	let base = `${conf.http.web_url}`;
	const qs_params: string[] = [ ];

	if (tagged_with) {
		base += `/tagged/${tagged_with}`;
	}

	else if (post_type) {
		base += `/${post_type}s`
	}
	
	if (count) {
		qs_params.push(`count=${count}`);
	}

	const oldest = posts[posts.length - 1];
	qs_params.push(`before=${oldest.date_published_iso}`);

	return `${base}?${qs_params.join('&')}`;
}

function page_context(count: number, tagged_with: string, before: string, post_type: posts.PostType, posts: store.posts.Post[]) {
	return {
		page_name: 'feed',
		get title() {
			return store.settings.get('feed_title');
		},
		get url() {
			return page_url(count);
		},
		get description() {
			return store.settings.get('feed_description');
		},
		count,
		tagged_with,
		post_type,
		before_iso: before,
		get before_utc() {
			return (new Date(before)).toUTCString();
		},
		get next_url() {
			return next_url(count, tagged_with, post_type, posts);
		},
		get is_posts() {
			return post_type === 'post';
		},
		get is_comments() {
			return post_type === 'comment';
		},
		get is_notes() {
			return post_type === 'note';
		},
		get is_events() {
			return post_type === 'event';
		},
		get is_rsvps() {
			return post_type === 'rsvp';
		},
	};
}

function build_html_for_posts(posts: store.posts.Post[], count: number, tagged_with?: string, before?: string, post_type?: posts.PostType) {
	const context = new store.templates.TemplateContext(page_context(count, tagged_with, before, post_type, posts), posts);
	return store.templates.render('page.html', context, partials);
}
