
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { get_unrendered, render } from './render';
import * as http_error from '../../../http-error';
import { store } from '../../../storage';
import { current_lang } from './i18n';

ctrl.get('/settings.html', async (req, res) => {
	if (store.settings.show_setup) {
		// If in setup mode, redirect to the main URL for first-time setup
		res.status(303);
		res.header('location', conf.http.ctrl_url);
		return { redirect_to: conf.http.ctrl_url };
	}

	res.type('text/html');

	const context = {
		page: {
			url: `${conf.http.ctrl_url}/settings.html`,
			name: 'settings',
			nav_section: 'settings',
			title: current_lang.pages.settings.title,
			require_auth: true
		},
		site: {
			url: conf.http.web_url
			// 
		},
		ctrl_panel: {
			url: conf.http.ctrl_url
		}
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel page for managing core site-wide settings">',
		page_content: await get_unrendered('settings.html')
	});

	return html;
});
