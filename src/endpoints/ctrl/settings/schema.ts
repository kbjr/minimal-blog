
export const settings_schema = {
	type: 'object',
	properties: {
		language: { type: 'string' },
		theme_light: { type: 'string' },
		theme_dark: { type: 'string' },
		feed_title: { type: 'string' },
		author_name: { type: 'string' },
		author_url: { type: 'string', format: 'url' },
		author_avatar: { type: 'string' },
		post_uri_format: {
			type: 'string',
			enum: ['slug', 'snowflake']
		}
	}
};
