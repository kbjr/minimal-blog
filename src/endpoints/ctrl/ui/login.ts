
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { assets, store } from '../../../storage';
import { render } from './render';
import { current_lang } from './i18n';
import { RouteShorthandOptions } from 'fastify';
import { redirect_for_first_time_setup } from './setup';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['X-HIDDEN']
	}
};

ctrl.get('/login', opts, async (req, res) => {
	if (redirect_for_first_time_setup(req, res)) return;
	
	res.type('text/html; charset=utf-8');

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
