
import { obj, str, arr } from '../../../json-schema';
import type { JSONSchema6 } from 'json-schema';

export const links_schema: JSONSchema6 = arr(
	obj({
		link_url: str('uri'),
		label: str(),
		icon: str(),
		rel: str(),
	}, {
		required: ['link_url', 'label', 'icon']
	})
);
