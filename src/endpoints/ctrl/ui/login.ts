
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
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
			title: current_lang.pages.login.title,
		}
	};
	
	const html = await render('login.html', context, { });
	return html;
});
