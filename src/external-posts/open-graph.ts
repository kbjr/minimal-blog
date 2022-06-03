
import { dict } from '../util';
import { DOMWindow } from 'jsdom';

export function parse_open_graph(window: DOMWindow) {
	const results = dict<string, string | string[]>();
	const meta_elems = window.document.head.querySelectorAll('meta[property^="og:"]');

	for (let i = 0; i < meta_elems.length; i++) {
		const elem = meta_elems[i];
		const prop = elem.getAttribute('property').slice(3);
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
