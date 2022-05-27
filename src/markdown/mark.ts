
import { marked } from 'marked';
import { renderer } from './renderer';

export interface MarkToken extends marked.Tokens.Generic {
	text: string;
}

export const mark_ext: marked.TokenizerExtension & marked.RendererExtension = {
	name: 'mark',
	level: 'inline',
	start: (src) => src.match(/=/)?.index,
	tokenizer(src, tokens) {
		const rule = /^==([^\n\s](?:(?:[^\n=]|=(?!=))*[^\n\s])?)==/;
		const match = rule.exec(src);

		if (match) {
			return {
				type: 'mark',
				raw: match[0],
				text: match[1],
				tokens: this.lexer.inlineTokens(match[1], [ ])
			};
		}
	},
	renderer(token: MarkToken) {
		return `<mark>${this.parser.parseInline(token.tokens, renderer)}</mark>`;
	}
};
