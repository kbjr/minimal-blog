
import { conf } from './conf';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import { highlight, languages } from 'prismjs';
import createDOMPurify = require('dompurify');
import load_languages = require('prismjs/components/index');

load_languages();

export interface MarkdownOptions {
	breaks?: boolean;
	inline?: boolean;
}

export function render_markdown_to_html(markdown: string, options: MarkdownOptions = { }) {
	const marked_options: marked.MarkedOptions = {
		baseUrl: conf.http.web_url + '/posts',
		breaks: options.breaks || false,
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
	return dom_purify.sanitize(html);
}
