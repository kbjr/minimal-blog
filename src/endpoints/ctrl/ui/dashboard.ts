
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { assets, store } from '../../../storage';
import { render } from './render';
import { RouteShorthandOptions } from 'fastify';
import { current_lang } from './i18n';
import { first_time_setup } from './setup';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['X-HIDDEN']
	}
};

ctrl.get('/', opts, async (req, res) => {
	res.type('text/html; charset=utf-8');
	return (await first_time_setup()) || (await render_dashboard_page());
});

async function render_dashboard_page() {
	const post_data = store.posts.get_posts(50, null, null, null, false);
	const draft_data = await store.posts.get_draft_posts(50);

	const posts = post_data.map((data) => new store.posts.Post(data));
	const drafts = draft_data.map((data) => new store.posts.Post(data));

	const context = {
		page: {
			url: conf.http.ctrl_url,
			title: current_lang.pages.dashboard.title,
			name: 'dashboard',
		},
		posts,
		drafts,
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel main dashboard page">',
		page_content: await assets.load_control_panel_asset('dashboard.html')
	});

	return html;
}
