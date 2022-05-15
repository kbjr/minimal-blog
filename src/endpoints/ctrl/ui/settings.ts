
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { render } from './render';
import { current_lang } from './i18n';
import { store, assets } from '../../../storage';

ctrl.get('/settings', async (req, res) => {
	if (store.settings.get('show_setup')) {
		// If in setup mode, redirect to the main URL for first-time setup
		res.status(303);
		res.header('location', conf.http.ctrl_url);
		return { redirect_to: conf.http.ctrl_url };
	}

	res.type('text/html');

	const context = {
		page: {
			url: `${conf.http.ctrl_url}/settings`,
			name: 'settings',
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
		page_content: await assets.load_control_panel_asset('settings.html')
	});

	return html;
});
