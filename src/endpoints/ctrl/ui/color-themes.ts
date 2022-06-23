
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { assets, store } from '../../../storage';
import { render } from './render';
import { RouteShorthandOptions } from 'fastify';
import { current_lang } from './i18n';
import { redirect_for_first_time_setup } from './setup';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['X-HIDDEN']
	}
};

ctrl.get('/color_themes', opts, async (req, res) => {
	if (redirect_for_first_time_setup(req, res)) return;

	res.type('text/html; charset=utf-8');

	const context = {
		page: {
			url: `${conf.http.ctrl_url}/color_themes`,
			title: current_lang.pages.color_themes.title,
			name: 'color-themes',
			require_auth: true
		}
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel page for color theme management">',
		page_content: await assets.load_control_panel_asset('color_themes.html'),
		color_input: await assets.load_control_panel_asset('color_input.js'),
	});

	return html;
});
