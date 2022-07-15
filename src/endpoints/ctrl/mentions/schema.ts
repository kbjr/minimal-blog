
import { store } from '../../../storage';
import type { JSONSchema6 } from 'json-schema';
import { obj, str, arr, str_enum, bool } from '../../../json-schema';

export const mentions_schema: JSONSchema6 = arr(
	obj({
		post_type: str_enum(store.posts.post_types()),
		uri_name: str(),
		source_url: str('uri'),
		vouch_url: str('uri'),
		snowflake: str(),
		needs_moderation: bool(),
		mention_type: str_enum([ 'pingback', 'webmention' ]),
		received_time: str('date-time'),
		verified: bool(),
		blocked: bool(),
	})
);

export const mentions_update_req_body_schema: JSONSchema6 = obj({
	needs_moderation: bool(),
	blocked: bool(),
});
