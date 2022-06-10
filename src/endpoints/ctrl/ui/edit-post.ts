
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { render } from './render';
import { assets, store } from '../../../storage';
import { current_lang } from './i18n';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RouteShorthandOptions } from 'fastify';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['X-HIDDEN']
	}
};

type Req = FastifyRequest<{
	Params: {
		is_new?: boolean;
		post_id?: string;
	};
}>;

ctrl.get('/edit_post/:post_id', opts, (req: Req, res: FastifyReply) => {
	return edit_post_endpoint(req, res);
});

ctrl.get('/edit_post', opts, (req: Req, res: FastifyReply) => {
	req.params.is_new = true;
	return edit_post_endpoint(req, res);
});

async function edit_post_endpoint(req: Req, res: FastifyReply) {
	if (store.settings.get('show_setup')) {
		// If in setup mode, redirect to the main URL for first-time setup
		res.status(303);
		res.header('location', conf.http.ctrl_url);
		return { redirect_to: conf.http.ctrl_url };
	}

	res.type('text/html; charset=utf-8');

	const { is_new, post_id } = req.params;
	const id_fragment = is_new ? '' : '/' + post_id;
	const context = {
		page: {
			url: `${conf.http.ctrl_url}/edit_post${id_fragment}`,
			name: 'edit-post',
			require_auth: true,
			post_id,
			is_new,
			markdown_textarea_placeholder
		},
		ctrl_panel: {
			url: conf.http.ctrl_url
		}
	};
	
	const html = await render('base.html', context, {
		page_head: '<meta name="description" content="Control panel page for creating, editing, and publishing posts">',
		page_content: await assets.load_control_panel_asset('edit_post.html'),
		markdown_preview: await assets.load_control_panel_asset('markdown_preview.js'),
	});

	return html;
}

const markdown_textarea_placeholder = `
## Headings

### Sub-Headings

#### etc.

**Bold**
_Italic_
\`Monospace\`

\`\`\`js
console.log('Code Blocks');
\`\`\`

$$
\\text{KaTeX Block}
$$
`.replace(/\n/g, '&#10;');
