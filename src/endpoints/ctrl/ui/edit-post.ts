
import { ctrl } from '../../../http';
import { conf } from '../../../conf';
import { render } from './render';
import { assets, store } from '../../../storage';
import { current_lang } from './i18n';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RouteShorthandOptions } from 'fastify';
import { redirect_for_first_time_setup } from './setup';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['X-HIDDEN']
	}
};

type Req = FastifyRequest<{
	Params: {
		post_type: store.posts.PostType;
		uri_name?: string;
	};
}>;


const post_types: store.posts.PostType[] = ['post', 'comment', 'note', 'event', 'rsvp'];

for (const post_type of post_types) {
	ctrl.get(`/create/${post_type}`, opts, (req: Req, res: FastifyReply) => {
		req.params.post_type = post_type;
		return edit_post_endpoint(req, res);
	});
	
	ctrl.get(`/edit/${post_type}/:uri_name`, opts, (req: Req, res: FastifyReply) => {
		req.params.post_type = post_type;
		return edit_post_endpoint(req, res);
	});
}

async function edit_post_endpoint(req: Req, res: FastifyReply) {
	if (redirect_for_first_time_setup(req, res)) return;

	res.type('text/html; charset=utf-8');

	const { post_type, uri_name } = req.params;
	const is_new = uri_name == null;
	const url = is_new
		? `${conf.http.ctrl_url}/create/${post_type}`
		: `${conf.http.ctrl_url}/edit/${post_type}/${uri_name}`
		;

	const type_specific_labels = current_lang.pages.posts.types[post_type];
	const label_page_title = (() => {
		switch (post_type) {
			case 'post':    return is_new ? current_lang.pages.create_post.title    : current_lang.pages.edit_post.title;
			case 'comment': return is_new ? current_lang.pages.create_comment.title : current_lang.pages.edit_comment.title;
			case 'note':    return is_new ? current_lang.pages.create_note.title    : current_lang.pages.edit_note.title;
			case 'event':   return is_new ? current_lang.pages.create_event.title   : current_lang.pages.edit_event.title;
			case 'rsvp':    return is_new ? current_lang.pages.create_rsvp.title    : current_lang.pages.edit_rsvp.title;
		}
	})();

	const context = {
		page: {
			url,
			name: 'edit-post',
			title: label_page_title,
		},
		ctrl_panel: {
			url: conf.http.ctrl_url
		},
		get uri_name_format() {
			return post_type === 'post'
				? store.settings.get('post_uri_format')
				: post_type === 'event'
					? store.settings.get('event_uri_format')
					: 'snowflake';
		},
		label_page_title,
		get post_type_is_post() {
			return post_type === 'post';
		},
		get post_type_is_comment() {
			return post_type === 'comment';
		},
		get post_type_is_note() {
			return post_type === 'note';
		},
		get post_type_is_event() {
			return post_type === 'event';
		},
		get post_type_is_rsvp() {
			return post_type === 'rsvp';
		},
		get post_type_has_title() {
			return post_type === 'post' || post_type === 'event';
		},
		get post_type_has_subtitle() {
			return post_type === 'post' || post_type === 'event';
		},
		get post_type_has_external_url() {
			return post_type === 'comment' || post_type === 'rsvp';
		},
		get label_helper_text() {
			return type_specific_labels.helper_text;
		},
		get label_post_title() {
			return 'post_title' in type_specific_labels ? type_specific_labels.post_title : null;
		},
		get label_external_url() {
			return 'external_url' in type_specific_labels ? type_specific_labels.external_url : null;
		},
		get label_save() {
			switch (post_type) {
				case 'post':    return is_new ? current_lang.pages.create_post.save    : current_lang.pages.edit_post.save;
				case 'comment': return is_new ? current_lang.pages.create_comment.save : current_lang.pages.edit_comment.save;
				case 'note':    return is_new ? current_lang.pages.create_note.save    : current_lang.pages.edit_note.save;
				case 'event':   return is_new ? current_lang.pages.create_event.save   : current_lang.pages.edit_event.save;
				case 'rsvp':    return is_new ? current_lang.pages.create_rsvp.save    : current_lang.pages.edit_rsvp.save;
			}
		},
		get label_publish() {
			switch (post_type) {
				case 'post':    return is_new ? current_lang.pages.create_post.publish    : current_lang.pages.edit_post.publish;
				case 'comment': return is_new ? current_lang.pages.create_comment.publish : current_lang.pages.edit_comment.publish;
				case 'note':    return is_new ? current_lang.pages.create_note.publish    : current_lang.pages.edit_note.publish;
				case 'event':   return is_new ? current_lang.pages.create_event.publish   : current_lang.pages.edit_event.publish;
				case 'rsvp':    return is_new ? current_lang.pages.create_rsvp.publish    : current_lang.pages.edit_rsvp.publish;
			}
		},
		post_type,
		uri_name,
		is_new,
		markdown_textarea_placeholder
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
