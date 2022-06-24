
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { render } from './render';
import { current_lang } from './i18n';
import { store, assets } from '../../../storage';
import { RouteShorthandOptions } from 'fastify';
import { redirect_for_first_time_setup } from './setup';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['X-HIDDEN']
	}
};

ctrl.get('/settings', opts, async (req, res) => {
	if (redirect_for_first_time_setup(req, res)) return;

	res.type('text/html; charset=utf-8');

	const context = {
		page: {
			url: `${conf.http.ctrl_url}/settings`,
			name: 'settings',
			title: current_lang.pages.settings.title,
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
