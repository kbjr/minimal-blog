
import type { JSONSchema6 } from 'json-schema';
import { arr, str, str_enum } from '../../../json-schema';

export const post_create_req_schema: JSONSchema6 = {
	type: 'object',
	properties: {
		post_type: str_enum(['post', 'comment', 'note', 'event', 'rsvp']),
		uri_name: str(),
		title: str(),
		subtitle: str(),
		external_url: str(),
		content_markdown: str(),
		image: str(),
		banner_image: str(),
		is_draft: { type: 'boolean', default: true },
		date_event_start: str('date-time'),
		date_event_end: str('date-time'),
		rsvp_type: str_enum(['yes', 'no', 'maybe', 'interested']),
		tags: arr(str()),
	},
	required: [ 'post_type', 'uri_name', 'content_markdown' ],
	additionalProperties: false,
};

export const post_res_schema: JSONSchema6 = {
	type: 'object',
	properties: {
		post_type: str_enum(['post', 'comment', 'note', 'event', 'rsvp']),
		uri_name: str(),
		title: str(),
		subtitle: str(),
		external_url: str(),
		content_html: str(),
		content_markdown: str(),
		image: str(),
		banner_image: str(),
		is_draft: { type: 'boolean' },
		date_published: str('date-time'),
		date_updated: str('date-time'),
		date_event_start: str('date-time'),
		date_event_end: str('date-time'),
		rsvp_type: str_enum(['yes', 'no', 'maybe', 'interested']),
		tags: arr(str()),
	}
};

export const post_update_req_schema: JSONSchema6 = {
	type: 'object',
	properties: {
		title: str(),
		subtitle: str(),
		external_url: str(),
		content_markdown: str(),
		image: str(),
		banner_image: str(),
		is_draft: { type: 'boolean' },
		date_event_start: str('date-time'),
		date_event_end: str('date-time'),
		rsvp_type: str_enum(['yes', 'no', 'maybe', 'interested']),
		tags: arr(str()),
	}
};
