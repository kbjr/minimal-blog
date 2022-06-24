
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { render } from './render';
import { assets, store } from '../../../storage';
import { current_lang } from './i18n';
import { RouteShorthandOptions } from 'fastify';
import { redirect_for_first_time_setup } from './setup';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['X-HIDDEN']
	}
};

ctrl.get('/posts', opts, async (req, res) => {
	if (redirect_for_first_time_setup(req, res)) return;

	res.type('text/html; charset=utf-8');

	const context = {
		page: {
			url: `${conf.http.ctrl_url}/posts`,
			name: 'posts',
			title: current_lang.pages.posts.title,
		},
		ctrl_panel: {
			url: conf.http.ctrl_url
		}
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel page for viewing a listing of posts to take action on">',
		page_content: await assets.load_control_panel_asset('posts.html')
	});

	return html;
});
