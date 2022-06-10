
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

ctrl.get('/', opts, async (req, res) => {
	res.type('text/html; charset=utf-8');

	if (store.settings.get('show_setup')) {
		if (store.users.has_no_users()) {
			return render_first_time_setup_page();
		}

		await store.settings.set('show_setup', false);
	}

	return render_dashboard_page();
});

async function render_dashboard_page() {
	const context = {
		page: {
			url: conf.http.ctrl_url,
			name: 'dashboard',
			require_auth: true,
		}
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel main dashboard page">',
		page_content: await assets.load_control_panel_asset('main.html')
	});

	return html;
}

async function render_first_time_setup_page() {
	const context = {
		page: {
			url: conf.http.ctrl_url,
			name: 'first-time-setup',
			require_auth: false,
		}
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel first-time setup page">',
		page_content: await assets.load_control_panel_asset('first_time_setup.html')
	});

	return html;
}
