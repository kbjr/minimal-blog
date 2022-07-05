
import { web } from '../../http';
import { throw_404_not_found } from '../../http-error';
import { store } from '../../storage';

web.get('/favicon', async (req, res) => {
	const body = store.settings.get('favicon');
	const type = store.settings.get('favicon_type');

	if (! body || ! type) {
		throw_404_not_found('Favicon not found');
	}

	res.type(type);
	return body;
});
