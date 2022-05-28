
import { marked } from 'marked';
import { renderer } from './renderer';

export interface NoteToken extends marked.Tokens.Generic {
	text: string;
}

export const note_ext: marked.TokenizerExtension & marked.RendererExtension = {
	name: 'note',
	level: 'block',
	start: (src) => src.match(/note>/)?.index,
	tokenizer(src, tokens) {
		const rule = /^note>(?:\s([^\n]*))?(?:\n|$)/;
		const match = rule.exec(src);

		if (match) {
			const token: NoteToken = {
				type: 'note',
				raw: match[0],
				text: match[1],
				tokens: [ ]
			};
			
			this.lexer.inline(token.text, token.tokens); 
			return token;
		}
	},
	renderer(token: NoteToken) {
		return `<p role="note">${this.parser.parseInline(token.tokens, renderer)}</p>`;
	}
};
