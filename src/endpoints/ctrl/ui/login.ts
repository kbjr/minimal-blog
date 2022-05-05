
import { ctrl } from '../../../http';
import { get_unrendered, render } from './render';
import * as http_error from '../../../http-error';
import { conf } from '../../../conf';

ctrl.get('/login.html', async (req, res) => {
	res.type('text/html');

	const context = {
		page: {
			url: `${conf.http.ctrl_url}/login.html`,
			title: 'Login',
			require_auth: false
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
		page_content: await get_unrendered('login.html')
	});

	return html;
});
