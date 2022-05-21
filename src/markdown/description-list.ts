
import { marked } from 'marked';

export interface DescriptionListToken extends marked.Tokens.Generic {
	items: (DescriptionTermToken | DescriptionDetailToken)[];
}

export interface DescriptionTermToken extends marked.Tokens.Generic {
	text: string;
}

export interface DescriptionDetailToken extends marked.Tokens.Generic {
	text: string;
}

export const description_list_ext: marked.TokenizerExtension & marked.RendererExtension = {
	name: 'description_list',
	level: 'block',
	start: (src) => src.match(/:[:#-]/)?.index,
	tokenizer(src, tokens) {
		const rule = /^(?::[:#-](?:\s[^\n]*)?(?:\n|$))+/;
		const match = rule.exec(src);

		if (match) {
			const token: DescriptionListToken = {
				type: 'description_list',
				raw: match[0],
				items: [ ]
			};

			const items = token.raw.trim().split('\n');
			const raw_buffer: string[] = [ ];
			const text_buffer: string[] = [ ];

			const flush_buffer = () => {
				if (! raw_buffer.length) {
					return;
				}

				// Grab the second character from the first line to determine the
				// token type (should be "#" or "-")
				const type = raw_buffer[0][1] === '#' ? 'description_term' : 'description_detail';
				
				const sub_token: (DescriptionTermToken | DescriptionDetailToken) = {
					type,
					raw: raw_buffer.join('\n'),
					text: text_buffer.join('\n'),
					tokens: [ ],
				};

				raw_buffer.length = 0;
				text_buffer.length = 0;

				this.lexer.blockTokens(sub_token.text, sub_token.tokens);
				token.items.push(sub_token);
			};

			for (const line of items) {
				const rule = /^:([:#-])(?:\s([^\n]*))?(?:\n|$)/;
				const match = rule.exec(line);
	
				if (match) {
					if (match[1] !== ':') {
						flush_buffer();
					}

					raw_buffer.push(match[0]);
					text_buffer.push(match[2]);
				}
			}

			flush_buffer();
			
			return token;
		}
	},
	renderer(token: DescriptionListToken) {
		const items = token.items.map((item) => {
			const tag = item.type === 'description_term' ? 'dt' : 'dd';
			return `
				<${tag}>
					${this.parser.parse(item.tokens)}
				</${tag}>
			`;
		});

		return `<dl>${items.join('')}</dl>`;
	}
};
