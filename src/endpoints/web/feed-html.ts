
import { web } from '../../http';
import { conf } from '../../conf';
import { store, TemplateName } from '../../storage';
import { FastifyRequest } from 'fastify';
import { TemplateContext } from '../../storage/templates';

let cached_page: string;
const default_count = 10;

store.feed.on('load', () => {
	cached_page = null;
});

store.feed.on('update', () => {
	cached_page = null;
});

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
	const html = build_feed_html(count, null, req.query.before);

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
	if (! before && ! tagged_with && count === default_count) {
		if (! cached_page) {
			cached_page = build_html_for_posts([ ], count, tagged_with, before);
		}
		
		return cached_page;
	}

	// TODO: with params
	return '<!-- Params not yet implemented -->';
}

function build_html_for_posts(posts: any[], count: number, tagged_with?: string, before?: string) {
	let feed_html = '<!-- Param {{= page.content =}} not yet rendered -->';
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

	const context = new TemplateContext({
		get title() {
			// TODO: More flexibility here
			return store.settings.feed_title;
		},
		get url() {
			return url;
		}
	});

	return store.templates.render(TemplateName.page_html, context, {
		get head() {
			return '';
		},
		get content() {
			return store.templates.templates[TemplateName.feed_html];
		}
	});
}
