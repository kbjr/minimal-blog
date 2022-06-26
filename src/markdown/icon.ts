
import { marked } from 'marked';
import { icons } from '../icons';

export interface IconToken extends marked.Tokens.Generic {
	text: string;
}

export const icon_ext: marked.TokenizerExtension & marked.RendererExtension = {
	name: 'icon',
	level: 'inline',
	start: (src) => src.match(/\{:/)?.index,
	tokenizer(src, tokens) {
		const rule = /^\{:([a-zA-Z0-9-]+):\}/;
		const match = rule.exec(src);

		if (match) {
			return {
				type: 'icon',
				raw: match[0],
				text: match[1],
				tokens: this.lexer.inlineTokens(match[1], [ ])
			};
		}
	},
	renderer(token: IconToken) {
		return icons[token.text] || `<!-- unknown icon "${token.text}" -->`;
	}
};
