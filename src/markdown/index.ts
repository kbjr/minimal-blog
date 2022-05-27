
import { marked } from 'marked';
import { conf } from '../conf';
import { renderer } from './renderer';
import { katex_block_ext, katex_inline_ext } from './katex';
import { footnote_list_ext, footnote_ref_ext } from './footnotes';
import { mark_ext } from './mark';
import { description_list_ext } from './description-list';
import { sanitize_html } from './sanitize';

marked.use({
	extensions: [
		katex_block_ext,
		katex_inline_ext,
		footnote_ref_ext,
		footnote_list_ext,
		mark_ext,
		description_list_ext,
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
