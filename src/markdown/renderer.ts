
import { marked } from 'marked';
import { highlight } from './prism';
import katex = require('katex');
import type { KatexOptions } from 'katex';
import render_bytefield = require('bytefield-svg');
import { renderSvg as render_nomnoml } from 'nomnoml';
import { pikchr } from 'pikchr';
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
	const language = infostring.trim().split(/\s+/g);
	const class_name = language ? ` class="language-${language}"` : '';

	if (language[0] === '') {
		return `<pre class="language-txt"><code>${escape(code, is_escaped)}</code></pre>`;
	}

	// Allow using `<samp>` tag rather than `<code>` tag where appropriate
	if (language[0] === 'samp') {
		return `<pre class="language-txt"><samp>${escape(code, is_escaped)}</samp></pre>`;
	}

	if (language[0] === 'render') {
		const flags = escape(language.slice(2).join(' '), false);
		switch (language[1]) {
			case 'katex': {
				const opts: KatexOptions = {
					displayMode: true,  // true == "block"
				};
		
				const markup = (katex as any).renderToString(code, opts);
				return `<div class="rendered-katex" data-flags="${flags}">${markup}</div>`;
			};
			
			case 'nomnoml': {
				const svg = render_nomnoml(code);
				const svg_no_dimensions = strip_svg(svg);
				return `<div class="rendered-nomnoml" data-flags="${flags}">${svg_no_dimensions}</div>`;
			};

			case 'vega': {
				// TODO: vega renders asynchronously, need a way to do that in marked
				// SEE: https://vega.github.io/vega/usage/#server-side-deployment-using-nodejs
				// SEE: https://github.com/markedjs/marked/pull/2474
				// SEE: https://github.com/markedjs/marked/issues/458

				break;
				// const json = JSON.parse(code);
				// const view = new vega.View(vega.parse(json), { renderer: 'none' });
				// return view.toSVG();
			};

			case 'wavedrom': {
				// SEE: https://www.npmjs.com/package/wavedrom
				break;
			};

			case 'bytefield': {
				const svg = render_bytefield(code);
				const svg_no_dimensions = strip_svg(svg);
				return `<div class="rendered-bytefield" data-flags="${flags}">${svg_no_dimensions}</div>`;
			};

			case 'pikchr': {
				return `<div class="rendered-pikchr" data-flags="${flags}">${pikchr(code)}</div>`;
			};

			case 'railroad': {
				// TODO: Render railroad diagrams
				// TODO: Custom implementation of try to make https://github.com/tabatkins/railroad-diagrams
				// or https://github.com/prantlf/railroad-diagrams work? Something else?
				break;
			};
		}

		// If we don't know how to render the given type, just output the raw
		// body like a code block
		return `<pre class="language-txt"><code>${escape(code, is_escaped)}</code></pre>`;
	}
	
	if (language) {
		const out = highlight(code, language[0]);

		if (out != null && out !== code) {
			is_escaped = true;
			code = out;
		}
	}

	return `<pre class="language-${language || 'txt'}"><code>${escape(code, is_escaped)}</code></pre>`;
};

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
