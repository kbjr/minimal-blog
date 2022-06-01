
import { str } from '../../../json-schema';
import type { JSONSchema6 } from 'json-schema';

export const links_schema: JSONSchema6 = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			link_url: str('uri'),
			label: str(),
			icon: str(),
		},
		required: ['link_url', 'label', 'icon']
	}
};
