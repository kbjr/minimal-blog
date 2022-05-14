
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { assets, store } from '../../../storage';
import { render } from './render';
import { current_lang } from './i18n';

ctrl.get('/color_themes', async (req, res) => {
	if (store.settings.show_setup) {
		// If in setup mode, redirect to the main URL for first-time setup
		res.status(303);
		res.header('location', conf.http.ctrl_url);
		return { redirect_to: conf.http.ctrl_url };
	}

	res.type('text/html');

	const context = {
		page: {
			url: `${conf.http.ctrl_url}/color_themes`,
			name: 'color-themes',
			title: current_lang.pages.color_themes.title,
			require_auth: true
		}
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel page for color theme management">',
		page_content: await assets.load_control_panel_asset('color_themes.html')
	});

	return html;
});
