
import { dict } from '../util';
import { DOMWindow } from 'jsdom';

export function parse_meta_tags(window: DOMWindow) {
	const results = dict<string, string | string[]>();
	const meta_elems = window.document.head.querySelectorAll('meta:not([property^="og:"])');

	for (let i = 0; i < meta_elems.length; i++) {
		const elem = meta_elems[i];
		const prop = elem.getAttribute('property') || elem.getAttribute('name');
		const content = elem.getAttribute('content');
		const prev = results[prop];
		
		if (prev == null) {
			results[prop] = content;
		}

		else {
			if (Array.isArray(prev)) {
				prev.push(content);
			}

			else {
				results[prop] = [ prev, content ];
			}
		}
	}

	return results;
}
