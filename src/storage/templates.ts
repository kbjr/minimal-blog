
import { conf } from '../conf';
import { store } from './store';
import { PostData } from './feed';
import { debug_logger } from '../debug';
import { load_default_template } from './assets';
import { EventEmitter } from 'events';
import { render, parse } from 'mustache';

const log = debug_logger('asset_files', `[asset_files]: `);

const default_templates = [
	'page.html',
	'feed_head.html',
	'feed_content.html',
	'post_head.html',
	'post_content.html',
	'not_found.html',
	'colors.css',
	'prism.css',
	'styles.css',
	'robots.txt',
	'svg_icon.js',
];

export type Templates = Record<string, string>;

export class TemplateManager extends EventEmitter {
	public templates: Partial<Templates>;

	public async load() {
		log('Loading all templates from storage');

		this.templates = await store.get_all_templates();

		for (const [name, template] of Object.entries(this.templates)) {
			log(`Pre-parsing template ${name} with moustache`);
			parse(template);
		}

		for (const name of default_templates) {
			if (this.templates[name] == null) {
				log(`Template ${name} not found in storage; Loading default from disk`);
				const content = await load_default_template(name);
				await this.update_template(name, content);
			}
		}

		this.emit('load');
	}

	public render(name: string, context: TemplateContext, partials: Record<string, string> = { }) : string {
		log(`Rendering template ${name}`);
		return render(this.templates[name], context, partials);
	}

	public get_template(name: string) {
		return this.templates[name];
	}

	public update_template(name: string, content: string) {
		log(`Updating template ${name}`);
		this.templates[name] = content;
		parse(content);
		this.emit('update', name);
		return store.set_template(name, content);
	}
}

const site_context = Object.freeze({
	get url() { return conf.http.web_url; },
	get language() { return store.settings.language; },
});

const colors_context = Object.freeze({
	get light() { return store.colors.light; },
	get dark() { return store.colors.dark; },
});

export class TemplateContext {
	public readonly site = site_context;
	public readonly colors = colors_context;

	public get feed() {
		return store.feed;
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
