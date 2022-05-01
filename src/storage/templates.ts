
import { store } from './store';
import { EventEmitter } from 'events';
import { load_default_template } from './defaults/templates';
import { conf } from '../conf';

export const enum TemplateName {
	page_html       = 'page.html',
	feed_html       = 'feed.html',
	post_html       = 'post.html',
	not_found_html  = 'not_found.html',
	colors_css      = 'colors.css',
	prism_css       = 'prism.css',
	styles_css      = 'styles.css',
	robots_txt      = 'robots.txt',
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
];

export type Templates = Record<TemplateName, string>;

export class TemplateManager extends EventEmitter {
	protected cache: Partial<Record<TemplateName, CompiledTemplate>> = { };
	protected templates: Partial<Templates>;

	public async load() {
		this.cache = { };
		this.templates = await store.get_all_templates();

		for (const name of template_names) {
			if (! this.templates[name]) {
				const content = await load_default_template(name);
				await this.update_template(name, content);
			}
		}

		this.emit('load');
	}

	public render(name: TemplateName, context: TemplateContext) : string {
		if (! this.cache[name]) {
			this.cache[name] = new CompiledTemplate(name, this.templates[name]);
		}

		return this.cache[name].render(context);
	}

	public update_template(name: TemplateName, content: string) {
		this.templates[name] = content;
		this.drop_cache(name);
		this.emit('update', name);
		return store.set_template(name, content);
	}

	public drop_cache(name: TemplateName) {
		this.cache[name] = null;
	}
}

const param_pattern = /\{\{=\s*[a-zA-Z_\.]+\s*=}}/g;

const param_funcs = {
	// ===== Site settings =====
	'site.url': () => conf.http.web_url,
	// 'site.title': () => store.settings.
	'site.language': () => store.settings.language,

	// ===== Light-theme colors =====
	'colors.light.sun':                  () => store.color_themes.light.sun,
	'colors.light.moon':                 () => store.color_themes.light.moon,
	'colors.light.bg_main':              () => store.color_themes.light.bg_main,
	'colors.light.bg_light':             () => store.color_themes.light.bg_light,
	'colors.light.bg_heavy':             () => store.color_themes.light.bg_heavy,
	'colors.light.bg_accent':            () => store.color_themes.light.bg_accent,
	'colors.light.line':                 () => store.color_themes.light.line,
	'colors.light.text_heading':         () => store.color_themes.light.text_heading,
	'colors.light.text_body':            () => store.color_themes.light.text_body,
	'colors.light.text_light':           () => store.color_themes.light.text_light,
	'colors.light.text_link':            () => store.color_themes.light.text_link,
	'colors.light.text_link_active':     () => store.color_themes.light.text_link_active,
	'colors.light.text_link_visited':    () => store.color_themes.light.text_link_visited,
	'colors.light.code_normal':          () => store.color_themes.light.code_normal,
	'colors.light.code_shadow':          () => store.color_themes.light.code_shadow,
	'colors.light.code_background':      () => store.color_themes.light.code_background,
	'colors.light.code_selection':       () => store.color_themes.light.code_selection,
	'colors.light.code_comment':         () => store.color_themes.light.code_comment,
	'colors.light.code_punc':            () => store.color_themes.light.code_punc,
	'colors.light.code_operator':        () => store.color_themes.light.code_operator,
	'colors.light.code_const_literal':   () => store.color_themes.light.code_const_literal,
	'colors.light.code_number_literal':  () => store.color_themes.light.code_number_literal,
	'colors.light.code_boolean_literal': () => store.color_themes.light.code_boolean_literal,
	'colors.light.code_tag':             () => store.color_themes.light.code_tag,
	'colors.light.code_string':          () => store.color_themes.light.code_string,
	'colors.light.code_keyword':         () => store.color_themes.light.code_keyword,
	'colors.light.code_func_name':       () => store.color_themes.light.code_func_name,
	'colors.light.code_class_name':      () => store.color_themes.light.code_class_name,
	'colors.light.code_regex_important': () => store.color_themes.light.code_regex_important,
	'colors.light.code_variable':        () => store.color_themes.light.code_variable,
	'colors.light.code_builtin':         () => store.color_themes.light.code_builtin,
	'colors.light.code_attr_name':       () => store.color_themes.light.code_attr_name,
	'colors.light.code_gutter_divider':  () => store.color_themes.light.code_gutter_divider,
	'colors.light.code_line_number':     () => store.color_themes.light.code_line_number,
	'colors.light.code_line_highlight':  () => store.color_themes.light.code_line_highlight,
	
	// ===== Dark-theme colors =====
	'colors.dark.sun':                  () => store.color_themes.dark.sun,
	'colors.dark.moon':                 () => store.color_themes.dark.moon,
	'colors.dark.bg_main':              () => store.color_themes.dark.bg_main,
	'colors.dark.bg_light':             () => store.color_themes.dark.bg_light,
	'colors.dark.bg_heavy':             () => store.color_themes.dark.bg_heavy,
	'colors.dark.bg_accent':            () => store.color_themes.dark.bg_accent,
	'colors.dark.line':                 () => store.color_themes.dark.line,
	'colors.dark.text_heading':         () => store.color_themes.dark.text_heading,
	'colors.dark.text_body':            () => store.color_themes.dark.text_body,
	'colors.dark.text_light':           () => store.color_themes.dark.text_light,
	'colors.dark.text_link':            () => store.color_themes.dark.text_link,
	'colors.dark.text_link_active':     () => store.color_themes.dark.text_link_active,
	'colors.dark.text_link_visited':    () => store.color_themes.dark.text_link_visited,
	'colors.dark.code_normal':          () => store.color_themes.dark.code_normal,
	'colors.dark.code_shadow':          () => store.color_themes.dark.code_shadow,
	'colors.dark.code_background':      () => store.color_themes.dark.code_background,
	'colors.dark.code_selection':       () => store.color_themes.dark.code_selection,
	'colors.dark.code_comment':         () => store.color_themes.dark.code_comment,
	'colors.dark.code_punc':            () => store.color_themes.dark.code_punc,
	'colors.dark.code_operator':        () => store.color_themes.dark.code_operator,
	'colors.dark.code_const_literal':   () => store.color_themes.dark.code_const_literal,
	'colors.dark.code_number_literal':  () => store.color_themes.dark.code_number_literal,
	'colors.dark.code_boolean_literal': () => store.color_themes.dark.code_boolean_literal,
	'colors.dark.code_tag':             () => store.color_themes.dark.code_tag,
	'colors.dark.code_string':          () => store.color_themes.dark.code_string,
	'colors.dark.code_keyword':         () => store.color_themes.dark.code_keyword,
	'colors.dark.code_func_name':       () => store.color_themes.dark.code_func_name,
	'colors.dark.code_class_name':      () => store.color_themes.dark.code_class_name,
	'colors.dark.code_regex_important': () => store.color_themes.dark.code_regex_important,
	'colors.dark.code_variable':        () => store.color_themes.dark.code_variable,
	'colors.dark.code_builtin':         () => store.color_themes.dark.code_builtin,
	'colors.dark.code_attr_name':       () => store.color_themes.dark.code_attr_name,
	'colors.dark.code_gutter_divider':  () => store.color_themes.dark.code_gutter_divider,
	'colors.dark.code_line_number':     () => store.color_themes.dark.code_line_number,
	'colors.dark.code_line_highlight':  () => store.color_themes.dark.code_line_highlight,

	// ===== Page data / fragments =====
	'page.url':     (context: TemplateContext) => context.page.url,
	'page.head':    (context: TemplateContext) => context.page.head,
	'page.content': (context: TemplateContext) => context.page.content,
	
	// ===== Feed content =====
	'feed.title': (context: TemplateContext) => context.feed.title,

	// ===== Post content =====
	'post.title': (context: TemplateContext) => context.post.title
};

class CompiledTemplate {
	private chunks: string[];
	private params: ((context: TemplateContext) => string | number)[];

	constructor(
		private name: string,
		private template: string
	) {
		this.compile();
	}

	public render(context: TemplateContext) {
		const chunks: (string | number)[] = [ ];

		let i = 0;
		for (; i < this.params.length; i++) {
			chunks.push(this.chunks[i]);
			chunks.push(this.params[i](context));
		}

		chunks.push(this.chunks[i]);
		return chunks.join('');
	}

	private compile() {
		this.chunks = this.template.split(param_pattern);
		this.params = [ ];

		param_pattern.lastIndex = 0;

		let match: RegExpExecArray;

		while (match = param_pattern.exec(this.template)) {
			const param = match[0].slice(3, -3).trim();
			const param_func = param_funcs[param];

			if (! param_func) {
				CompileTemplateError.throw(`Unknown template parameter`, this.name, param);
			}

			this.params.push(param_func);
		}
	}
}

export class CompileTemplateError extends Error {
	public param: string;
	public template: string;
	public static throw(message: string, template: string, param?: string) : never {
		const error = new CompileTemplateError(message);
		error.param = param;
		error.template = template;
		throw error;
	}
}

export interface TemplateContext {
	page?: {
		url: string;
		head: string;
		content: string;
	};
	feed?: {
		title: string;
		// 
	};
	post?: {
		// ...
		title: string;
	};
}
