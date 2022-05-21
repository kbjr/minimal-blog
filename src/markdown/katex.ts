
import { marked } from 'marked';
import katex = require('katex');
import type { KatexOptions } from 'katex';

export interface KatexToken extends marked.Tokens.Generic {
	text: string;
}

export const katex_block_ext: marked.TokenizerExtension & marked.RendererExtension = {
	name: 'katex_block',
	level: 'block',
	start: (src) => src.match(/\$\$/)?.index,
	tokenizer(src, tokens) {
		const rule = /^\$\$([\s\S]+?)\$\$/;
		const match = rule.exec(src);

		if (match) {
			return {
				type: 'katex_block',
				raw: match[0],
				text: match[1]
			};
		}
	},
	renderer(token: KatexToken) {
		const opts: KatexOptions = {
			displayMode: true,  // true == "block"
		};

		return (katex as any).renderToString(token.text, opts);
	}
};

export const katex_inline_ext: marked.TokenizerExtension & marked.RendererExtension = {
	name: 'katex_inline',
	level: 'inline',
	start: (src) => src.match(/\$/)?.index,
	tokenizer(src, tokens) {
		const rule = /^\$([^\n\s](?:[^\n]+[^\n\s])?)\$/;
		const match = rule.exec(src);

		if (match) {
			return {
				type: 'katex_inline',
				raw: match[0],
				text: match[1]
			};
		}
	},
	renderer(token: KatexToken) {
		const opts: KatexOptions = {
			displayMode: false,  // false == "inline"
		};

		return (katex as any).renderToString(token.text, opts);
	}
};
