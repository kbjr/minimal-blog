
import { store } from './store';
import { EventEmitter } from 'events';
import { conf } from '../conf';
import { render, parse } from 'mustache';
import { load_default_template } from './defaults/templates';

export const enum TemplateName {
	page_html             = 'page.html',
	feed_html             = 'feed.html',
	post_html             = 'post.html',
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
	TemplateName.feed_html,
	TemplateName.post_html,
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
		this.templates = await store.get_all_templates();

		for (const template of Object.values(this.templates)) {
			parse(template);
		}

		for (const name of template_names) {
			if (! this.templates[name]) {
				const content = await load_default_template(name);
				await this.update_template(name, content);
			}
		}

		this.emit('load');
	}

	public render(name: TemplateName, context: TemplateContext, partials: Record<string, string> = { }) : string {
		return render(this.templates[name], context, partials);
	}

	public update_template(name: TemplateName, content: string) {
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
		public readonly posts?: Post[],
		public readonly post?: Post
	) { }
}

export interface PageContext {
	url: string;
	title: string;
}

export interface Post {
	title: string;
}
