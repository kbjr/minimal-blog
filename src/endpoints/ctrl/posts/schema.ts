
import type { JSONSchema6 } from 'json-schema';

export const post_create_req_schema: JSONSchema6 = {
	type: 'object',
	properties: {
		uri_name: { type: 'string' },
		title: { type: 'string' },
		subtitle: { type: 'string' },
		external_url: { type: 'string' },
		content_markdown: { type: 'string' },
		image: { type: 'string' },
		banner_image: { type: 'string' },
		is_draft: { type: 'boolean', default: true },
		tags: {
			type: 'array',
			items: { type: 'string' },
		},
	},
	required: [ 'uri_name', 'content_markdown' ],
	additionalProperties: false,
};

export const post_res_schema: JSONSchema6 = {
	type: 'object',
	properties: {
		post_type: {
			type: 'string',
			enum: ['post', 'comment']
		},
		uri_name: { type: 'string' },
		title: { type: 'string' },
		subtitle: { type: 'string' },
		external_url: { type: 'string' },
		content_html: { type: 'string' },
		content_markdown: { type: 'string' },
		image: { type: 'string' },
		banner_image: { type: 'string' },
		is_draft: { type: 'boolean' },
		date_published: { type: 'string', format: 'date-time' },
		date_updated: { type: 'string', format: 'date-time' },
		tags: {
			type: 'array',
			items: { type: 'string' },
		},
	}
};

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
