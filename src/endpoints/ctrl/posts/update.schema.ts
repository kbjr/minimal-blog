
import type { JSONSchema6 } from 'json-schema';

export const post_update_req_schema: JSONSchema6 = {
	type: 'object',
	properties: {
		title: { type: 'string' },
		subtitle: { type: 'string' },
		external_url: { type: 'string' },
		content_markdown: { type: 'string' },
		image: { type: 'string' },
		banner_image: { type: 'string' },
		is_draft: { type: 'boolean' },
		tags: {
			type: 'array',
			items: { type: 'string' },
		},
	}
};
