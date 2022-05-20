
import { conf } from '../conf';
import { debug_logger } from '../debug';
import { load_default_template } from './assets';
import { render as mustache_render, parse } from 'mustache';
import { settings, colors, feed, store, events } from './store';
import { PostData } from './posts';

const log = debug_logger('asset_files', `[asset_files]: `);

export type Templates = Record<string, string>;
let templates: Partial<Templates>

const editable_ui_templates = [
	'page.html',
	'feed_head.html',
	'feed_content.html',
	'post_head.html',
	'post_content.html',
	'not_found.html',
	'styles.css',
	'robots.txt',
	'svg_icon.js',
];

export async function load() {
	log('Loading all templates from storage');

	templates = await store.get_all_templates();

	for (const [name, template] of Object.entries(templates)) {
		log(`Pre-parsing template ${name} with moustache`);
		parse(template);
	}

	for (const name of editable_ui_templates) {
		if (templates[name] == null) {
			log(`Template ${name} not found in storage; Loading default from disk`);
			const content = await load_default_template(name);
			await update_template(name, content);
		}
	}

	events.emit('templates.load');
}

export function render(name: string, context: TemplateContext, partials: Record<string, string> = { }) : string {
	log(`Rendering template ${name}`);
	return mustache_render(templates[name], context, partials);
}

export function get_template(name: string) {
	return templates[name];
}

export function update_template(name: string, content: string) {
	log(`Updating template ${name}`);
	templates[name] = content;
	parse(content);
	events.emit('templates.update', name);
	return store.set_template(name, content);
}

const site_context = Object.freeze({
	get url() { return conf.http.web_url; },
	get language() { return settings.get('language'); },
});

const colors_context = Object.freeze({
	get light() { return colors.get_light(); },
	get dark() { return colors.get_dark(); },
});

const feed_context = Object.freeze({
	get url_html() { return feed.get_url_html(); },
	get url_json_feed() { return feed.get_url_json_feed(); },
	get url_rss() { return feed.get_url_rss(); },
	get url_atom() { return feed.get_url_atom(); },
	get url_pingback() { return feed.get_url_pingback(); },
	get url_webmention() { return feed.get_url_webmention(); },
	get url_webmention_trusted() { return feed.get_url_webmention_trusted(); },
	get send_pingback_enabled() { return feed.send_pingback_enabled(); },
	get receive_pingback_enabled() { return feed.receive_pingback_enabled(); },
	get send_webmention_enabled() { return feed.send_webmention_enabled(); },
	get receive_webmention_enabled() { return feed.receive_webmention_enabled(); },
});

export class TemplateContext {
	public readonly site = site_context;
	public readonly colors = colors_context;
	public readonly feed = feed_context;

	constructor(
		public readonly page: Readonly<PageContext>,
		public readonly posts?: PostData[],
		public readonly post?: PostData
	) { }
}

export interface PageContext {
	url: string;
	title: string;
}
