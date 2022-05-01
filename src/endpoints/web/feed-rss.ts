
import { web } from '../../http';
import { conf } from '../../conf';
import { store } from '../../storage';
import { FastifyRequest } from 'fastify';
import { create as create_xml } from 'xmlbuilder2';

let cached_feed: string;
const default_count = 10;

store.feed.on('load', () => {
	cached_feed = null;
});

store.feed.on('update', () => {
	cached_feed = null;
});

type Req = FastifyRequest<{
	Querystring: {
		before?: string;
		tagged_with?: string;
		count?: string;
	};
}>;

web.get('/feed.rss.xml', async (req: Req, res) => {
	const count = Math.max(1, req.query.count ? Math.min(parseInt(req.query.count, 10), 25) : default_count) | 0;
	const xml = build_feed_xml(count, req.query.tagged_with, req.query.before);

	res.type('application/rss+xml');
	res.header('content-language', store.settings.language);
	res.send(xml);
});

function build_feed_xml(count: number, tagged_with?: string, before?: string) {
	if (! before && ! tagged_with && count === default_count) {
		if (! cached_feed) {
			// TODO: page generation
			cached_feed = build_xml_for_posts([ ], count, tagged_with, before);
		}
		
		return cached_feed;
	}

	return '<!-- Params not yet implemented -->';
}

function build_xml_for_posts(posts: any[], count: number, tagged_with?: string, before?: string) {
	const doc = create_xml({ version: '1.0' });
	const rss = doc.ele('rss', { version: '2.0' });
	const channel = rss.ele('channel');

	channel.ele('title').txt(store.settings.feed_title);
	channel.ele('link').txt(conf.http.web_url);
	// channel.ele('description').txt('');
	channel.ele('language').txt(store.settings.language);
	// channel.ele('copyright').txt(`Copyright ${(new Date).getFullYear()} James Brumond`);
	// channel.ele('pubDate').txt(publish_date.toUTCString());
	// channel.ele('lastBuildDate').txt(build_date.toUTCString());
	// channel.ele('categories').txt('');
	// channel.ele('docs').txt('');
	// channel.ele('generator').txt('');
	// channel.ele('managingEditor').txt('james@jbrumond.me');
	// channel.ele('webMaster').txt('james@jbrumond.me');
	// channel.ele('ttl').txt('');
	// channel.ele('image').txt('');
	// channel.ele('skipHours').txt('');
	// channel.ele('skipDays').txt('');

	// posts.forEach((post) => {
	// 	const item = channel.ele('item');

	// 	item.ele('title').txt(post.title);
	// 	item.ele('link').txt(post.post_url);
	// 	item.ele('description').txt(post.subtitle);
	// 	item.ele('author').txt(post.authors[0].email);
	// 	// item.ele('categories').txt('');
	// 	item.ele('comments').txt(post.discussion_url);
	// 	item.ele('pubDate').txt(utc_date(post.published));
	// 	item.ele('guid').txt(post.post_url);
	// });

	return doc.end({ prettyPrint: true });
}

function utc_date(date_str: string) {
	const date = new Date(Date.parse(date_str));
	return date.toUTCString();
}
