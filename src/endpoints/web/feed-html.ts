
import { web } from '../../http';
import { conf } from '../../conf';
import { store } from '../../storage';
import { str } from '../../json-schema';
import { rendered_template_cache } from '../../cache';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { read_as_entry, read_as_event } from '../../external-posts';

const default_count = 10;

const partials = store.templates.page_partials('feed_content.html', 'feed_meta.html');

const cached_page = rendered_template_cache('page.html', get_default_context, partials, {
	settings: true,
	templates: true,
	colors: true,
	posts: true,
	links: true,
});

type Req = FastifyRequest<{
	Params: {
		tag?: string;
	};
	Querystring: {
		query?: string;
		count?: number;
		before?: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		querystring: {
			query: str(),
			count: {
				type: 'integer',
				minimum: 1,
				maximum: 25,
				default: default_count,
			},
			before: str('date-time'),
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

if (conf.data.enable_search) {
	type Req = FastifyRequest<{
		Querystring: {
			query: string;
		};
	}>;
	
	web.get('/search', opts, async (req: Req, res) => {
		const html = await build_search_html(req.query.query);
	
		res.type('text/html; charset=utf-8');
		res.header('content-language', store.settings.get('language'));
		res.send(html);
	});
}

async function build_feed_html(count: number, tagged_with?: string, before?: string, post_type?: store.posts.PostType) {
	const data = await store.posts.get_posts(count, tagged_with, before, post_type, false);
	const posts = await Promise.all(data.map(map_post_data));
	return build_html_for_posts(posts, null, count, tagged_with, before, post_type);
}

async function build_search_html(query: string) {
	const data = await store.posts.search_posts(query);
	const posts = await Promise.all(data.map(map_post_data));
	return build_html_for_posts(posts, query, posts.length, null, null, null);
}

async function get_default_context() {
	const data = await store.posts.get_posts(default_count, null, null, null, false);
	const posts = await Promise.all(data.map(map_post_data));
	const page = page_context(default_count, null, null, null, null, posts);
	const context = new store.templates.TemplateContext(page, posts);
	return context;
}

async function map_post_data(data: store.posts.PostData) {
	const post = new store.posts.Post(data);

	if (data.external_url) {
		if (data.post_type === 'rsvp') {
			post.external_data = await read_as_event(post.external_url);
		}

		else {
			post.external_data = await read_as_entry(post.external_url);
		}
	}

	return post;
}

function page_url(count: number, tagged_with?: string, before?: string, post_type?: store.posts.PostType) {
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

function next_url(count: number, tagged_with: string, post_type: store.posts.PostType, posts: store.posts.Post[]) {
	// If we didn't find enough posts for this page, assume that means
	// there are no more and we shouldn't return a next link
	if (posts.length < count) {
		return null;
	}

	let base = `${conf.http.web_url}`;
	const qs_params: string[] = [ ];

	if (tagged_with) {
		base += `/tagged/${encodeURIComponent(tagged_with)}`;
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

function page_context(count: number, query: string, tagged_with: string, before: string, post_type: store.posts.PostType, posts: store.posts.Post[]) {
	return {
		page_name: 'feed',
		get is_feed() {
			return true;
		},
		get title() {
			return store.settings.get('feed_title');
		},
		get url() {
			return page_url(count, tagged_with, before, post_type);
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
			return query ? null : next_url(count, tagged_with, post_type, posts);
		},
		get is_search() {
			return !! query;
		},
		get search_query() {
			return query;
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

function build_html_for_posts(posts: store.posts.Post[], query: string, count: number, tagged_with?: string, before?: string, post_type?: store.posts.PostType) {
	const page = page_context(count, query, tagged_with, before, post_type, posts);
	const context = new store.templates.TemplateContext(page, posts);
	return store.templates.render('page.html', context, partials);
}
