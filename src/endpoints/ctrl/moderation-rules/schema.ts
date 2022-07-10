
import type { JSONSchema6 } from 'json-schema';
import { obj, str, arr, str_enum } from '../../../json-schema';

export const rules_schema: JSONSchema6 = arr(
	obj({
		source_url: str('uri'),
		pingback_rule: str_enum([ 'allow', 'block', 'review', 'default' ]),
		webmention_rule: str_enum([ 'allow', 'block', 'review', 'default' ]),
		notes: str(),
	}, {
		required: ['source_url', 'pingback_rule', 'webmention_rule']
	})
);
