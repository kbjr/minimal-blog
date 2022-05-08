
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { store } from '../../../storage';
import { get_unrendered, render } from './render';
import { current_lang } from './i18n';

ctrl.get('/', async (req, res) => {
	res.type('text/html');

	if (store.settings.show_setup) {
		if (store.users.no_users) {
			return render_first_time_setup_page();
		}

		await store.settings.set_show_setup(0);
	}

	return render_main_page();
});

async function render_main_page() {
	const context = {
		page: {
			url: conf.http.ctrl_url,
			name: 'main',
			title: current_lang.pages.main.title,
			require_auth: true,
		}
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel main landing page">',
		page_content: await get_unrendered('main.html')
	});

	return html;
}

async function render_first_time_setup_page() {
	const context = {
		page: {
			url: conf.http.ctrl_url,
			name: 'first-time-setup',
			title: current_lang.pages.first_time_setup.title,
			require_auth: false,
		}
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel first-time setup page">',
		page_content: await get_unrendered('first_time_setup.html')
	});

	return html;
}
