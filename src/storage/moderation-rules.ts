
import { obj } from '../util';
import { store } from './store';

export type ModerationRuleType = 'allow' | 'block' | 'review' | 'default';

let rules: ModerationRuleData[];

export async function load() {
	rules = await store.get_all_moderation_rules();
}

export function get_rules() {
	return rules.map((rule) => obj(rule));
}

export async function update_rules(new_rules: ModerationRuleData[]) {
	await store.update_moderation_rules(new_rules);
	rules = new_rules.map((rule) => obj(rule));
}

export function find_rule(source_url: string) {
	let len = 0;
	let match: ModerationRuleData;

	for (const rule of rules) {
		if (rule.source_url.length > len) {
			if (source_url.startsWith(rule.source_url)) {
				len = rule.source_url.length;
				match = rule;
			}
		}
	}

	return match;
}

export interface ModerationRuleData {
	source_url: string;
	pingback_rule: ModerationRuleType;
	webmention_rule: ModerationRuleType;
	notes: string;
}
