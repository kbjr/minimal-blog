
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

ctrl.get('/moderation_queue', opts, async (req, res) => {
	if (redirect_for_first_time_setup(req, res)) return;

	res.type('text/html; charset=utf-8');

	const context = {
		page: {
			url: `${conf.http.ctrl_url}/moderation_queue`,
			name: 'moderation_queue',
			title: current_lang.pages.moderation_queue.title,
		}
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel page for moderating inbound mentions">',
		page_content: await assets.load_control_panel_asset('moderation_queue.html')
	});

	return html;
});
