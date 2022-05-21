
import { marked } from 'marked';
import { conf } from '../conf';
import { JSDOM } from 'jsdom';
import { highlight, languages } from 'prismjs';
import { katex_block_ext, katex_inline_ext } from './katex';
import { footnote_list_ext, footnote_ref_ext } from './footnotes';
// import {  } from './definition-list';

import createDOMPurify = require('dompurify');
import load_languages = require('prismjs/components/index');
import { renderer } from './renderer';

load_languages();

marked.use({
	extensions: [
		katex_block_ext,
		katex_inline_ext,
		footnote_ref_ext,
		footnote_list_ext,
	]
});

export interface MarkdownOptions {
	breaks?: boolean;
	inline?: boolean;
}

export function render_markdown_to_html(markdown: string, options: MarkdownOptions = { }) {
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

			const safe_html = sanitize_html(unsafe_html);
			resolve(safe_html);
		});
	});
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
