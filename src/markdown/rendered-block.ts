
import { marked } from 'marked';
import katex = require('katex');
import type { KatexOptions } from 'katex';

export interface RenderedBlockToken extends marked.Tokens.Generic {
	info: string;
	text: string;
}

export const rendered_block_ext: marked.TokenizerExtension & marked.RendererExtension = {
	name: 'rendered_block',
	level: 'block',
	start: (src) => src.match(/&&&/)?.index,
	tokenizer(src, tokens) {
		const rule = /^&&&([^\n]+)((?:[^&]|&&?(?!&))+)\n&&&/;
		const match = rule.exec(src);

		if (match) {
			return {
				type: 'rendered_block',
				raw: match[0],
				info: match[1].trim(),
				text: match[2].trim()
			};
		}
	},
	renderer(token: RenderedBlockToken) {
		const [ type ] = token.info.split(/\s/g);

		switch (type) {
			case 'katex': {
				const opts: KatexOptions = {
					displayMode: true,  // true == "block"
				};
		
				return (katex as any).renderToString(token.text, opts);
			};

			case 'railroad':
				// TODO: Render railroad diagrams
				// TODO: Custom implementation of try to make https://github.com/tabatkins/railroad-diagrams
				// or https://github.com/prantlf/railroad-diagrams work? Something else?
				break;

			case 'mermaid':
				// TODO: Render mermaid-style diagrams
				// TODO: Make this more generic and do something like "flow-chart"?
				// TODO: Custom implementation or try to make mermaid work server-side? Something else?
				break;
		}

		// If we don't know how to render the given type, just output the raw
		// body like a code block
		return `<pre class="language-txt"><code>`
			+ token.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
			+ `</code></pre>`
			;
	}
};
