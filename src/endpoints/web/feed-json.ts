
import { web } from '../../http';

web.get('/feed.json', async (req, res) => {
	res.type('application/feed+json');
	res.header('content-language', 'en-US');  // TODO: from config

	// TODO: build json feed
	return {
		version: 'https://jsonfeed.org/version/1.1',
		// ...
	};
});
