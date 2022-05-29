
import { conf } from '../../conf';
import { web } from '../../http';
import { store } from '../../storage';
import { custom_cache } from '../../cache';
import { posts } from '../../storage/store';
import { create as create_xml } from 'xmlbuilder2';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

const sitemap = custom_cache(build_sitemap, {
	feed: true,
	posts: true,
});

web.get('/sitemap.xml', async (req, res) => {
	const xml = await sitemap();

	res.type('text/xml; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(xml);
});

// TODO: Make priorities / frequencies configurable
// TODO: Support for sitemap index file for large sites (https://www.sitemaps.org/protocol.html#index)

async function build_sitemap() {
	const now = (new Date).toISOString();
	const doc = create_xml({ version: '1.0', encoding: 'UTF-8' });
	const urlset = doc.ele('urlset', {
		'xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
		'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
		'xsi:schemaLocation': 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd'
	});
	
	const tag_data = posts.list_tags();
	const post_data = await posts.get_posts(Infinity, null, null, null, false);
	
	url_elem(urlset, conf.http.web_url, now, 'daily', 1.0);
	url_elem(urlset, conf.http.web_url + '/posts', now, 'daily', 0.5);
	url_elem(urlset, conf.http.web_url + '/comments', now, 'daily', 0.5);
	url_elem(urlset, conf.http.web_url + '/notes', now, 'daily', 0.5);
	url_elem(urlset, conf.http.web_url + '/events', now, 'daily', 0.5);
	url_elem(urlset, conf.http.web_url + '/rsvps', now, 'daily', 0.5);

	for (const data of tag_data) {
		const tag = new posts.Tag(data);
		url_elem(urlset, tag.tag_url, tag.tag_last_modified_iso, 'daily', 0.9);
	}

	for (const data of post_data) {
		const post = new posts.Post(data);
		let priority = 0.5;
		let change_freq: ChangeFreq = 'daily';

		switch (data.post_type) {
			case 'note':
			case 'comment':
			case 'rsvp':
				priority = 0.4;
				break;

			case 'post':
				priority = 0.8;
				break;

			case 'event':
				priority = 0.6;
				break;
		}

		url_elem(urlset, post.post_url, post.date_updated_iso || post.date_published_iso, change_freq, priority);
	}

	return doc.end({ prettyPrint: true });
}

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

function url_elem(urlset: XMLBuilder, loc: string, lastmod: string, change_freq?: ChangeFreq, priority?: number) {
	const url = urlset.ele('url');

	url.ele('loc').txt(loc);
	url.ele('lastmod').txt(lastmod);

	if (change_freq) {
		url.ele('changefreq').txt(change_freq);
	}

	if (priority != null) {
		url.ele('priority').txt(priority.toFixed(1));
	}

	return url;
}
