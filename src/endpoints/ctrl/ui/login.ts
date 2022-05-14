
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { assets, store } from '../../../storage';
import { render } from './render';
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
		page_content: await assets.load_control_panel_asset('login.html')
	});

	return html;
});
