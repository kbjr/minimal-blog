
import { conf } from '../conf';
import { PostData, PostType } from './posts';
import { ExternalEntry, ExternalEvent } from '../external-posts';
import { dict, obj, wrap_date } from '../util';
import { unique_id } from '../snowflake';
import { events, store } from './store';

export type MentionType = 'webmention' | 'pingback' /* | 'all' */;
export type ModerationRuleType = 'allow' | 'block' | 'review' | /* 'trust' | */ null;

let rules: ModerationRuleData[];

export async function load() {
	rules = await store.get_all_moderation_rules();
	// 
}

// export async function update_mention(snowflake: string, data: Partial<EditableMentionData>) {
// 	const mention = mentions_by_snowflake[snowflake];

// 	// todo: actually update mention

// 	events.emit('mentions.update', mention);
// }

export interface ModerationRuleData {
	source_url: string;
	mention_type: MentionType;
	rule_type: ModerationRuleType;
	notes: string;
	// vouch_url?: string;
}
