
import { marked } from 'marked';
import { obj } from '../util';
import { highlight } from './prism';

export const renderer = new marked.Renderer();

renderer.heading = function(text, level, raw, slugger) {
	const id = slugger.slug(raw);
	
	return `
		<h${level} id="${id}">
			${text}
			<a class="heading-anchor" href="#${id}">
				<svg-icon icon="link" aria-hidden="true"></svg-icon>
				<span style="display: none">Section titled ${text}</span>
			</a>
		</h${level}>
	`;
};

renderer.code = function(code: string, infostring: string, is_escaped: boolean) {
	// Support for supplying addition configuration alongside the language:
	// 
	// ```js tag:samp line_numbers line_start:5
	// console.log('hi');
	// ```
	const [ language, opts ] = parse_options(infostring);

	const inner_tag = opts.tag || 'code';
	const class_name = language ? ` class="language-${language}"` : '';
	const line_start = opts.line_start != null ? ` data-line-start="${opts.line_start}"` : '';
	
	if (language) {
		const out = highlight(code, language);

		if (out != null && out !== code) {
			is_escaped = true;
			code = out;
		}
	}

	if (opts.line_numbers) {
		// TODO: Finish building line number support if I ever care enough...
	}

	if (! is_escaped) {
		code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
	}
	
	return `<pre${class_name}${line_start}>`
		+ `<${inner_tag}>`
		+ code
		+ `</${inner_tag}>`
		+ `</pre>`
		;
};

interface CodeOptions {
	tag?: 'code' | 'samp';
	line_numbers?: boolean;
	line_start?: number;
}

function parse_options(raw_language: string) : [lang: string, opts: CodeOptions] {
	const [ language, ...raw_opts ] = raw_language.split(' ');
	const opts: CodeOptions = obj();

	for (const opt of raw_opts) {
		const [ key, value ] = opt.split(':');

		switch (key) {
			case 'tag':
				if (value === 'code' || value === 'samp') {
					opts.tag = value;
				}
				break;

			case 'line_numbers':
				opts.line_numbers = (value !== 'off' && value !== 'false');
				break;

			case 'line_start':
				opts.line_start = parseInt(value, 10);
				break;
		}
	}

	return [ language, opts ];
}
