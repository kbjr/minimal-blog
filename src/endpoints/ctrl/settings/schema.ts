
import type { JSONSchema6 } from 'json-schema';
import { bool, str, str_enum } from '../../../json-schema';

export const settings_schema: JSONSchema6 = {
	type: 'object',
	properties: {
		language: str(),
		ctrl_panel_language: str(),
		theme_light: str(),
		theme_dark: str(),
		feed_title: str(),
		feed_description: str(),
		author_name: str(),
		author_url: str('uri'),
		author_avatar: str(),
		copyright_notice: str(),
		send_pingback: bool(),
		receive_pingback: bool(),
		send_webmention: bool(),
		receive_webmention: bool(),
		https_only: bool(),
		default_pingback: str_enum(['allow', 'block', 'review']),
		default_webmention: str_enum(['allow', 'block', 'review']),
		post_uri_format: str_enum(['slug', 'snowflake']),
		event_uri_format: str_enum(['slug', 'snowflake']),
	}
};
