
import { web } from '../../http';

web.get('/feed.xml', async (req, res) => {
	res.type('application/rss+xml');
	res.header('content-language', 'en-US');  // TODO: from config
	res.send('');  // TODO: build rss feed
});
