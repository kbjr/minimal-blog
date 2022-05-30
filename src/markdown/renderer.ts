
import { marked } from 'marked';
import { highlight } from './prism';
import katex = require('katex');
import type { KatexOptions } from 'katex';
import render_bytefield = require('bytefield-svg');
import { renderSvg as render_nomnoml } from 'nomnoml';
import { pikchr } from 'pikchr';
import { parse as parse_yaml } from 'yaml';
import railroad from '@prantlf/railroad-diagrams';
// import * as vega from 'vega';


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
	const args = parse_code_args(infostring);

	if (! args || ! args[0]) {
		return `<pre class="language-txt"><code>${escape(code, is_escaped)}</code></pre>`;
	}

	// Allow using `<samp>` tag rather than `<code>` tag where appropriate
	if (args[0] === 'samp') {
		return `<pre class="language-txt"><samp>${escape(code, is_escaped)}</samp></pre>`;
	}

	if (args[0] === 'render') {
		const grammar = args[1];
		const flags = escape(args.slice(2).join(' '), false);
		const rendered = render_subgrammar(code, grammar, is_escaped);
		return `<div class="rendered-${grammar}" data-flags="${flags}">${rendered}</div>`
	}
	
	if (args[0] === 'figure') {
		const grammar = args[1];
		const caption = args[2];
		const flags = escape(args.slice(3).join(' '), false);
		const rendered = render_subgrammar(code, grammar, is_escaped);
		return `<figure class="rendered-${grammar}" data-flags="${flags}">${rendered}<figcaption>${escape(caption, false)}</figcaption></figure>`;
	}

	const out = highlight(code, args[0]);

	if (out != null && out !== code) {
		is_escaped = true;
		code = out;
	}

	return `<pre class="language-${args[0] || 'txt'}"><code>${escape(code, is_escaped)}</code></pre>`;
};

const arg_pattern = /^(?:[a-zA-Z0-9_:-]+|"(?:[^"\n]|(?<=\\)")*")/;

function parse_code_args(text: string) {
	const args: string[] = [ ];

	text = text.trim();

	while (text.length) {
		const match = arg_pattern.exec(text);

		if (! match) {
			break;
		}

		if (match[0][0] === '"') {
			args.push(match[0].slice(1, -1));
		}

		else {
			args.push(match[0]);
		}

		text = text.slice(match[0].length).trimStart();
	}

	return args;
}

function render_subgrammar(text: string, grammar: string, is_escaped: boolean) {
	switch (grammar) {
		case 'katex': {
			const opts: KatexOptions = {
				displayMode: true,  // true == "block"
			};
	
			return (katex as any).renderToString(text, opts);
		};
		
		case 'nomnoml': {
			const svg = render_nomnoml(text);
			return strip_svg(svg);
		};

		case 'vega': {
			// TODO: vega renders asynchronously, need a way to do that in marked
			// SEE: https://vega.github.io/vega/usage/#server-side-deployment-using-nodejs
			// SEE: https://github.com/markedjs/marked/pull/2474
			// SEE: https://github.com/markedjs/marked/issues/458

			break;
			// const json = JSON.parse(text);
			// const view = new vega.View(vega.parse(json), { renderer: 'none' });
			// return view.toSVG();
		};

		case 'wavedrom': {
			// SEE: https://www.npmjs.com/package/wavedrom
			break;
		};

		case 'bytefield': {
			const svg = render_bytefield(text);
			return strip_svg(svg);
		};

		case 'pikchr': {
			return pikchr(text);
		};

		case 'railroad': {
			// SEE: https://www.npmjs.com/package/@prantlf/railroad-diagrams#user-content-components
			const yaml = parse_yaml(text);
			const diagram = railroad.Diagram.fromJSON(yaml);
			return strip_svg(diagram.toString());
		};
	}

	// If we don't know how to render the given type, just output the raw
	// body like a code block
	return `<pre class="language-txt"><code>${escape(text, is_escaped)}</code></pre>`;
}

function escape(str: string, is_escaped: boolean) {
	return is_escaped ? str : str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

const svg_header = /^<\?xml version="1\.0" encoding="UTF-8"\?>/;
const svg_dimensions = /^<svg[^>]* (height="[\d\.]+"\s+width="[\d\.]+"|width="[\d\.]+"\s+height="[\d\.]+")/;

// Removes fixed dimension attributes and meta-declaration from SVGs so we can scale them with CSS
function strip_svg(svg: string) {
	return svg
		.replace(svg_header, '')
		.replace(svg_dimensions, (match, dimensions) => {
			return match.slice(0, -dimensions.length);
		});
}
