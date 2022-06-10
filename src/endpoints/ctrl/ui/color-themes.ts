
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { assets, store } from '../../../storage';
import { render } from './render';
import { RouteShorthandOptions } from 'fastify';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['X-HIDDEN']
	}
};

ctrl.get('/color_themes', opts, async (req, res) => {
	if (store.settings.get('show_setup')) {
		// If in setup mode, redirect to the main URL for first-time setup
		res.status(303);
		res.header('location', conf.http.ctrl_url);
		return { redirect_to: conf.http.ctrl_url };
	}

	res.type('text/html; charset=utf-8');

	const context = {
		page: {
			url: `${conf.http.ctrl_url}/color_themes`,
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
