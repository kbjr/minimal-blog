
import { marked } from 'marked';
import { conf } from './conf';
import { JSDOM } from 'jsdom';
import { highlight, languages } from 'prismjs';
import { dict } from './util';

import katex = require('katex');
import type { KatexOptions } from 'katex';

import createDOMPurify = require('dompurify');
import load_languages = require('prismjs/components/index');

load_languages();

const math_exprs = Symbol('math_expressions');

export interface MarkdownOptions {
	breaks?: boolean;
	inline?: boolean;
}

export function render_markdown_to_html(markdown: string, options: MarkdownOptions = { }) {
	const renderer = create_renderer();
	const marked_options: marked.MarkedOptions = {
		baseUrl: conf.http.web_url + '/posts',
		breaks: options.breaks || false,
		renderer,
		highlight(code, lang) {
			const grammar = typeof languages[lang] === 'object' ? languages[lang] : languages.plain;
			return highlight(code, grammar, lang);
		}
	};

	return new Promise<string>((resolve, reject) => {
		const parse = options.inline ? marked.parseInline : marked.parse;

		parse(markdown, marked_options, (error, unsafe_html) => {
			if (error) {
				return reject(error);
			}
			
			const unsafe_html_with_katex = unsafe_html.replace(/(__special_katex_id_\d+__)/g, (_match, capture) => {
				const { type, expression } = renderer[math_exprs][capture];
				const opts: KatexOptions = {
					displayMode: type == 'block',
					
					// output: 'html'
				};

				return (katex as any).renderToString(expression, opts);
			});

			const safe_html = sanitize_html(unsafe_html_with_katex);
			resolve(safe_html);
		});
	});
}

interface KatexExpr {
	type: 'block' | 'inline';
	expression: string;
}

function create_renderer() : marked.Renderer & { [math_exprs]: Record<string, KatexExpr> } {
	let i = 0;
	const next_id = () => `__special_katex_id_${i++}__`;
	const math_expressions = dict<string, KatexExpr>();

	const renderer = new marked.Renderer();

	renderer.heading = function(text, level, raw, slugger) {
		const id = slugger.slug(raw);
		
		return `
			<h${level} id="${id}">
				${text}
				<a class="heading-anchor" href="#${id}">
					<svg-icon icon="link" aria-hidden="true"></svg-icon>
					<span></span>
				</a>
			</h${level}>
		`;
	};
	
	const original_listitem = renderer.listitem;
	const original_paragraph = renderer.paragraph;
	const original_tablecell = renderer.tablecell;
	const original_text = renderer.text;

	renderer.listitem = function(text: string, task: boolean, checked: boolean) {
		return original_listitem.call(renderer, replace_math_expressions(text), task, checked);
	};

	renderer.paragraph = function(text: string) {
		return original_paragraph.call(renderer, replace_math_expressions(text));
	};

	renderer.tablecell = function(content: string, flags: Object) {
		return original_tablecell.call(renderer, replace_math_expressions(content), flags);
	};

	renderer.text = function(text: string) {
		return original_text.call(renderer, replace_math_expressions(text));
	};

	function replace_math_expressions(text: string) {
		text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_match, expression) => {
			const id = next_id();
			math_expressions[id] = { type: 'block', expression };
			return id;
		});
	
		text = text.replace(/\$([^\n\s]+?)\$/g, (_match, expression) => {
			const id = next_id();
			math_expressions[id] = { type: 'inline', expression };
			return id;
		});
	
		return text;
	}

	return Object.assign(renderer, { [math_exprs]: math_expressions });
}

function sanitize_html(html: string) : string {
	const { window } = new JSDOM('');
	const dom_purify = createDOMPurify(window as any as Window);
	return dom_purify.sanitize(html, {
		CUSTOM_ELEMENT_HANDLING: {
			tagNameCheck: (tag_name) => tag_name === 'svg-icon',
			attributeNameCheck: (attr_name) => attr_name === 'icon',
		}
	});
}
