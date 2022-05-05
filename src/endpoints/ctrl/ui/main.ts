
import { ctrl } from '../../../http';
import { get_unrendered, render } from './render';
import * as http_error from '../../../http-error';
import { conf } from '../../../conf';
import { store } from '../../../storage';

ctrl.get('/', async (req, res) => {
	res.type('text/html');

	if (store.settings.show_setup && store.users.no_users) {
		return render_first_time_setup_page();
	}

	return render_main_page();
});

async function render_main_page() {
	const context = {
		page: {
			url: conf.http.ctrl_url,
			title: 'Main',
			require_auth: true,
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
		page_head: '',
		page_content: await get_unrendered('main.html')
	});

	return html;
}

async function render_first_time_setup_page() {
	const context = {
		page: {
			url: conf.http.ctrl_url,
			title: 'First Time Setup',
			require_auth: false,
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
		page_head: '',
		page_content: await get_unrendered('first_time_setup.html')
	});

	return html;
}
