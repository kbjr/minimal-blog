
import { web } from '../../http';
import { conf } from '../../conf';
import { store, TemplateName } from '../../storage';
import { FastifyRequest } from 'fastify';

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
	let page_title = store.settings.feed_title;
	let feed_html = '<!-- Param {{= page.content =}} not yet rendered -->';

	const context = {
		page: {
			url: '',
			head: '',
			title: page_title,
			get content() {
				return feed_html;
			}
		}
	};

	// page_title = store.templates.render(TemplateName.feed_page_title, context);
	feed_html = store.templates.render(TemplateName.feed_html, context);

	return store.templates.render(TemplateName.page_html, context);
}
