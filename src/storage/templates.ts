
import { store } from './store';
import { EventEmitter } from 'events';
import { conf } from '../conf';
import { render, parse } from 'mustache';
import { load_default_template } from './default-templates';
import { PostData } from './feed';
import { debug_logger } from '../debug';

const log = debug_logger('web_templates', `[web_templates]: `);

export const enum TemplateName {
	page_html             = 'page.html',
	feed_head_html        = 'feed_head.html',
	feed_content_html     = 'feed_content.html',
	post_head_html        = 'post_head.html',
	post_content_html     = 'post_content.html',
	not_found_html        = 'not_found.html',
	colors_css            = 'colors.css',
	prism_css             = 'prism.css',
	styles_css            = 'styles.css',
	robots_txt            = 'robots.txt',
	time_js               = 'time.js',
	prism_js              = 'prism.js',
	svg_icon_js           = 'svg_icon.js',
	color_theme_toggle_js = 'color_theme_toggle.js',
}

const template_names = [
	TemplateName.page_html,
	TemplateName.feed_head_html,
	TemplateName.feed_content_html,
	TemplateName.post_head_html,
	TemplateName.post_content_html,
	TemplateName.not_found_html,
	TemplateName.colors_css,
	TemplateName.prism_css,
	TemplateName.styles_css,
	TemplateName.robots_txt,
	TemplateName.time_js,
	TemplateName.prism_js,
	TemplateName.svg_icon_js,
	TemplateName.color_theme_toggle_js,
];

export type Templates = Record<TemplateName, string>;

export class TemplateManager extends EventEmitter {
	public templates: Partial<Templates>;

	public async load() {
		log('Loading all templates from storage');

		this.templates = await store.get_all_templates();

		for (const [name, template] of Object.entries(this.templates)) {
			log(`Pre-parsing template ${name} with moustache`);
			parse(template);
		}

		for (const name of template_names) {
			if (this.templates[name] == null) {
				log(`Template ${name} not found in storage; Loading default from disk`);
				const content = await load_default_template(name);
				await this.update_template(name, content);
			}
		}

		this.emit('load');
	}

	public render(name: TemplateName, context: TemplateContext, partials: Record<string, string> = { }) : string {
		log(`Rendering template ${name}`);
		return render(this.templates[name], context, partials);
	}

	public get_template(name: TemplateName) {
		return this.templates[name];
	}

	public update_template(name: TemplateName, content: string) {
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
	get light() { return store.color_themes.light; },
	get dark() { return store.color_themes.dark; },
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
