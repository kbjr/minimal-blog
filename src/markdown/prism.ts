
import { highlight as prism_highlight, languages/* , hooks */ } from 'prismjs';
import load_languages = require('prismjs/components/index');

load_languages();

// hooks.add('after-tokenize', (env) => {
// 	// 
// });

export function highlight(code: string, lang: string) {
	const grammar = typeof languages[lang] === 'object' ? languages[lang] : languages.plain;
	return prism_highlight(code, grammar, lang);
}
