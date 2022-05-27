
export const settings_schema = {
	type: 'object',
	properties: {
		language: { type: 'string' },
		theme_light: { type: 'string' },
		theme_dark: { type: 'string' },
		feed_title: { type: 'string' },
		feed_description: { type: 'string' },
		author_name: { type: 'string' },
		author_url: { type: 'string', format: 'url' },
		author_avatar: { type: 'string' },
		copyright_notice: { type: 'string' },
		send_pingback: { type: 'boolean' },
		receive_pingback: { type: 'boolean' },
		send_webmention: { type: 'boolean' },
		receive_webmention: { type: 'boolean' },
		default_pingback: {
			type: 'string',
			enum: ['allow', 'block', 'review']
		},
		default_webmention: {
			type: 'string',
			enum: ['allow', 'block', 'review']
		},
		post_uri_format: {
			type: 'string',
			enum: ['slug', 'snowflake']
		},
		event_uri_format: {
			type: 'string',
			enum: ['slug', 'snowflake']
		}
	}
};
