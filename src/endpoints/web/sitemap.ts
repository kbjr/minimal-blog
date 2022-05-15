
import { custom_cache } from '../../cache';
import { conf } from '../../conf';
import { web } from '../../http';
import { store } from '../../storage';

const sitemap = custom_cache(build_sitemap, {
	feed: true
});

web.get('/sitemap.xml', async (req, res) => {
	const xml = sitemap();

	res.type('text/xml');
	res.header('content-language', store.settings.get('language'));
	res.send(xml);
});

// TODO: Updates to sitemap generation to read from `store.feed`
// TODO: Updates to use xmlbuilder

async function build_sitemap() {
	const last_mod = (new Date).toISOString();

	return urlset_elem([
		url_elem(conf.http.web_url, last_mod)
	]);
}

const tag_url = (tag: string) => url_elem(
	`${conf.http.web_url}/tagged/${tag}`,
	(new Date).toISOString()
	// posts_by_tag[tag][0].published
);

const urlset_elem = (urls: string[]) => `
<urlset
	xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>${urls.join('\n')}</urlset>
`;

const url_elem = (loc: string, lastmod: string) => `
	<url>
		<loc>${loc}</loc>
		<lastmod>${lastmod}</lastmod>
	</url>
`;
