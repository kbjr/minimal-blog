
import { conf } from '../conf';
import { PostData } from './feed';
import { debug_logger } from '../debug';
import { load_default_template } from './assets';
import { render as mustache_render, parse } from 'mustache';
import { settings, colors, feed, store, events } from './store';

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

export class TemplateContext {
	public readonly site = site_context;
	public readonly colors = colors_context;

	public get feed() {
		return feed;
	}

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
