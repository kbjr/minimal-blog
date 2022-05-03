
import { web } from '../../http';
import { conf } from '../../conf';
import { store, TemplateName } from '../../storage';
import { FastifyRequest } from 'fastify';
import { TemplateContext } from '../../storage/templates';
import { template_cache } from '../../cache';
import { PostData } from '../../storage/feed';

const default_count = 10;

const partials = Object.freeze({
	get page_head() {
		return store.templates.templates[TemplateName.feed_head_html];
	},
	get page_content() {
		return store.templates.templates[TemplateName.feed_content_html];
	}
});

const default_context = new TemplateContext(page_context(default_count));
const cached_page = template_cache(TemplateName.page_html, partials, default_context);

type Req = FastifyRequest<{
	Params: {
		tag?: string;
	};
	Querystring: {
		before?: string;
		count?: string;
	};
}>;

web.get('/', async (req: Req, res) => {
	const count = Math.max(1, req.query.count ? Math.min(parseInt(req.query.count, 10), 25) : default_count) | 0;
	const html = (! req.query.before && count === default_count)
		? cached_page.get_value()
		: build_feed_html(count, null, req.query.before);

	res.type('text/html');
	res.header('content-language', store.settings.language);
	res.send(html);
});

web.get('/tagged/:tag', async (req: Req, res) => {
	const count = Math.max(1, req.query.count ? Math.min(parseInt(req.query.count, 10), 25) : default_count) | 0;
	const html = build_feed_html(count, req.params.tag, req.query.before);

	res.type('text/html');
	res.header('content-language', store.settings.language);
	res.send(html);
});

function build_feed_html(count: number, tagged_with?: string, before?: string) {
	// TODO: Get posts
	return build_html_for_posts([ ], count, tagged_with, before);
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
			return store.settings.feed_title;
		},
		get url() {
			return page_url(count);
		}
	};
}

function build_html_for_posts(posts: PostData[], count: number, tagged_with?: string, before?: string) {
	const context = new TemplateContext(page_context(count, tagged_with, before), posts);
	return store.templates.render(TemplateName.page_html, context, partials);
}
