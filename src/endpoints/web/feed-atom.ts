
import { web } from '../../http';
import { create as create_xml } from 'xmlbuilder2';
import { conf } from '../../conf';
import { store } from '../../storage';

// https://en.wikipedia.org/wiki/Atom_(Web_standard)
// https://datatracker.ietf.org/doc/html/rfc4287
web.get('/feed.atom.xml', async (req, res) => {
	res.type('application/atom+xml');
	res.header('content-language', store.settings.get('language'));
	res.send('');  // TODO: build atom feed
});
