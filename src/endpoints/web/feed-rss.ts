
import { web } from '../../http';
import { conf } from '../../conf';
import { store } from '../../storage';
import { FastifyRequest } from 'fastify';
import { create as create_xml } from 'xmlbuilder2';
import { custom_cache } from '../../cache';
import { PostData } from '../../storage/posts';

const default_count = 10;
const front_page = custom_cache(async () => {
	const posts = await store.posts.get_posts(default_count, null, null, null, false);
	return build_xml_for_posts(posts, default_count);
}, { posts: true });

type Req = FastifyRequest<{
	Querystring: {
		before?: string;
		tagged_with?: string;
		count?: string;
	};
}>;

web.get('/feed.rss.xml', async (req: Req, res) => {
	const count = Math.max(1, req.query.count ? Math.min(parseInt(req.query.count, 10), 25) : default_count) | 0;
	const xml = await build_feed_xml(count, req.query.tagged_with, req.query.before);

	res.type('application/rss+xml; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(xml);
});

async function build_feed_xml(count: number, tagged_with?: string, before?: string) {
	if (! before && ! tagged_with && count === default_count) {
		return front_page();
	}

	const posts = await store.posts.get_posts(count, tagged_with, before, null, false);
	return build_xml_for_posts(posts, default_count);
}

function build_xml_for_posts(post_data: PostData[], count: number, tagged_with?: string, before?: string) {
	const doc = create_xml({ version: '1.0' });
	const rss = doc.ele('rss', { version: '2.0' });
	const channel = rss.ele('channel');
	const author_name = store.settings.get('author_name');
	const author_url = store.settings.get('author_url');
	const author = author_name
		? author_url
			? `${author_name} (${author_url})`
			: author_name
		: author_url
			? author_url
			: null;

	channel.ele('title').txt(store.settings.get('feed_title'));
	channel.ele('link').txt(conf.http.web_url);

	const desc = store.settings.get('feed_description');

	if (desc) {
		channel.ele('description').txt(desc);
	}
	
	channel.ele('language').txt(store.settings.get('language'));

	const copyright = store.settings.get('copyright_notice');
	
	if (copyright) {
		channel.ele('copyright').txt(store.settings.get('copyright_notice'));
	}

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

	for (const data of post_data) {
		const item = channel.ele('item');
		const post = new store.posts.Post(data);

		item.ele('title').txt(post.title);
		item.ele('link').txt(post.post_url);

		if (post.subtitle) {
			item.ele('description').txt(post.subtitle);
		}
		
		if (author) {
			item.ele('author').txt(author);
		}

		post.tags.forEach((tag) => item.ele('categories').txt(tag));

		item.ele('pubDate').txt(post.date_published_utc);
		item.ele('guid').txt(post.post_url);
	}

	return doc.end({ prettyPrint: true });
}
