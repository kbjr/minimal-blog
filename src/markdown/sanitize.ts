
import { JSDOM } from 'jsdom';
import createDOMPurify = require('dompurify');

export function sanitize_html(html: string) : string {
	const { window } = new JSDOM('');
	const dom_purify = createDOMPurify(window as any as Window);
	return dom_purify.sanitize(html, {
		CUSTOM_ELEMENT_HANDLING: {
			tagNameCheck: (tag_name) => tag_name === 'svg-icon',
			attributeNameCheck: (attr_name) => attr_name === 'icon',
		}
	});
}
