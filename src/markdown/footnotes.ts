
import { marked } from 'marked';
import { renderer } from './renderer';

const footnotes = Symbol('footnotes');

// We're going to hang some extra data off of the lexer so we can reference it
// later when generating links back to references
declare module 'marked' {
	export interface Lexer {
		[footnotes]: Record<number, number>;
	}
}

export interface FootnoteLinkToken extends marked.Tokens.Generic {
	id: number;
	inst: number;
}

export const footnote_ref_ext: marked.TokenizerExtension & marked.RendererExtension = {
	name: 'footnote_ref',
	level: 'inline',
	start: (src) => src.match(/\[\^/)?.index,
	tokenizer(src, tokens) {
		const rule = /^\[\^(\d+)]/;
		const match = rule.exec(src);

		if (match) {
			const id = parseInt(match[1], 10);

			return {
				type: 'footnote_ref',
				raw: match[0],
				id: id,
				inst: next_cite_inst(this.lexer, id)
			};
		}
	},
	renderer(token: FootnoteLinkToken) {
		return `<sup id="cite:ref-${token.id}-${token.inst}"><a href="#cite:note-${token.id}">[${token.id}]</a></sup>`;
	}
};

export interface FootnoteListToken extends marked.Tokens.Generic {
	text: string;
	items: FootnoteToken[];
}

export interface FootnoteToken extends marked.Tokens.Generic {
	id: number;
	text: string;
	inst_count() : number;
}

export const footnote_list_ext: marked.TokenizerExtension & marked.RendererExtension = {
	name: 'footnote_list',
	level: 'block',
	start: (src) => src.match(/\[/)?.index,
	tokenizer(src, tokens) {
		const rule = /^(\[\d+]:[^\n]*(?:\n|$))+/;
		const match = rule.exec(src);

		if (match) {
			const token: FootnoteListToken = {
				type: 'footnote_list',
				raw: match[0],
				text: match[0].trim(),
				items: null
			};

			const items = token.text.split('\n');
			
			token.items = items.map((src) => {
				const rule = /^\[(\d+)]:([^\n]*)(?:\n|$)/;
				const match = rule.exec(src);

				if (match) {
					const id = parseInt(match[1], 10);
					const token: FootnoteToken = {
						type: 'footnote',
						raw: match[0],
						id: id,
						text: match[2],
						tokens: [ ],
						inst_count: () => get_cite_inst_count(this.lexer, id)
					};

					this.lexer.inline(token.text, token.tokens); 
					return token;
				}
			});

			return token;
		}
	},
	renderer(token: FootnoteListToken) {
		const items = token.items.map((item) => (`
			<li role="doc-footnote" value="${item.id}" id="cite:note-${item.id}">
				${footnote_link_backs(item.id, item.inst_count())}
				${this.parser.parseInline(item.tokens, renderer)}
			</li>
		`));

		return `<ol role="doc-endnotes">${items.join('')}</ol>`;
	}
};

function get_cite_inst_count(lexer: marked.Lexer, id: number) {
	if (! lexer[footnotes]) {
		lexer[footnotes] = { };
	}
	
	return lexer[footnotes][id] || 0;
}

function next_cite_inst(lexer: marked.Lexer, id: number) {
	if (! lexer[footnotes]) {
		lexer[footnotes] = { };
	}

	if (! lexer[footnotes][id]) {
		lexer[footnotes][id] = 0;
	}

	return ++lexer[footnotes][id];
}

const letters = 'abcdefghijklmnopqrstuvwxyz';

function footnote_link_backs(id: number, count: number) {
	if (! count) {
		return '';
	}

	if (count === 1) {
		return `<sup><a href="#cite:ref-${id}-1" title="Back to reference">^</a></sup>`;
	}

	// note: We're using letters for link backs; If we run out, only
	// show the first 26 references
	// todo: A more ideal solution would be to start using double-letters,
	// like "aa", "ab", "ac", etc. after running out of single letter options
	count = Math.min(count, 26);

	const links: string[] = [ ];

	for (let i = 0; i < count; i++) {
		const letter = letters[i];
		links[i] = `<a href="#cite:ref-${id}-${i + 1}" title="Back to reference ${letter}">${letter}</a>`;
	}

	return `<sup>^ ${links.join(' ')}</sup>`;
}
