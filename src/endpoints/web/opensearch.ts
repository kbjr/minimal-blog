
import { conf } from '../../conf';
import { web } from '../../http';
import { store } from '../../storage';
import { custom_cache } from '../../cache';
import { create as create_xml } from 'xmlbuilder2';

const opensearch = custom_cache(build_opensearch, {
	settings: true
});

if (conf.data.enable_search) {
	web.get('/opensearch.xml', async (req, res) => {
		const xml = await opensearch();
	
		res.type('application/opensearchdescription+xml; charset=utf-8');
		res.header('content-language', store.settings.get('language'));
		res.send(xml);
	});
}

async function build_opensearch() {
	const doc = create_xml({ version: '1.0', encoding: 'UTF-8' });
	const search = doc.ele('OpenSearchDescription', {
		'xmlns': 'http://a9.com/-/spec/opensearch/1.1/'
	});

	const feed_title = store.settings.get('feed_title');
	search.ele('ShortName').txt(feed_title.slice(0, 16));
	search.ele('LongName').txt(feed_title);
	search.ele('Description').txt(`Search content posted on ${conf.http.web_url}`);
	search.ele('InputEncoding').txt('UTF-8');
	search.ele('OutputEncoding').txt('UTF-8');
	search.ele('Language').txt(store.settings.get('language'));
	
	search.ele('Image').txt(`${conf.http.web_url}/favicon`);

	const copyright = store.settings.get('copyright_notice');

	if (copyright) {
		search.ele('Attribution').txt(copyright);
	}

	search.ele('Url', {
		rel: 'self',
		type: 'application/opensearchdescription+xml',
		template: `${conf.http.web_url}/opensearch.xml`
	});

	search.ele('Url', {
		rel: 'results',
		type: 'text/html',
		template: `${conf.http.web_url}/search?query={searchTerms}`
	});

	return doc.end({ prettyPrint: true });
}
