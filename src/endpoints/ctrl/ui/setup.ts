
import { render } from './render';
import { conf } from '../../../conf';
import { current_lang } from './i18n';
import { assets, store } from '../../../storage';
import { throw_500_internal_server_error } from '../../../http-error';
import { FastifyReply, FastifyRequest } from 'fastify';

export function first_time_setup() {
	const show_setup = store.settings.get('show_setup', true);
	
	if (show_setup) {
		if (! conf.auth.setup_code) {
			throw_500_internal_server_error('setup_code not defined');
		}

		const password_hash = store.settings.get('password_hash', true);

		if (password_hash) {
			throw_500_internal_server_error('settings.db corrupted');
		}

		return render_first_time_setup_page();
	}
}

export function redirect_for_first_time_setup(req: FastifyRequest, res: FastifyReply) {
	const show_setup = store.settings.get('show_setup', true);
	
	if (show_setup) {
		if (! conf.auth.setup_code) {
			throw_500_internal_server_error('setup_code not defined');
		}

		const password_hash = store.settings.get('password_hash', true);

		if (password_hash) {
			throw_500_internal_server_error('settings.db corrupted');
		}

		res.status(303);
		res.header('location', conf.http.ctrl_url);
		res.send({ redirect_to: conf.http.ctrl_url });
		return true;
	}

	return false;
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
		page_content: await assets.load_control_panel_asset('first_time_setup.html')
	});

	return html;
}
