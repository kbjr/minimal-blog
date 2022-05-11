
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { store } from '../../../storage';
import { get_unrendered, render } from './render';
import { current_lang } from './i18n';

ctrl.get('/login', async (req, res) => {
	if (store.settings.show_setup) {
		// If in setup mode, redirect to the main URL for first-time setup
		res.status(303);
		res.header('location', conf.http.ctrl_url);
		return { redirect_to: conf.http.ctrl_url };
	}

	res.type('text/html');

	const context = {
		page: {
			url: `${conf.http.ctrl_url}/login`,
			name: 'login',
			title: current_lang.pages.login.title,
			require_auth: false
		}
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel login page">',
		page_content: await get_unrendered('login.html')
	});

	return html;
});
