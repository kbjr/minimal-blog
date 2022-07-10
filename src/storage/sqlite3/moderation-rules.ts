
import { ModerationRuleData } from '../moderation-rules';
import { run, get_all, sql, settings_pool } from './db';

export async function get_all_moderation_rules() {
	const db = await settings_pool.acquire();

	try {
		return await get_all<ModerationRuleData>(db, sql_get_moderation_rules);
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_get_moderation_rules = sql(`
select
	source_url,
	pingback_rule,
	webmention_rule,
	notes
from moderation_rules
`);

export async function update_moderation_rules(new_rules: ModerationRuleData[]) {
	const db = await settings_pool.acquire();
	
	try {
		// fixme: This is a pretty naive imlementation of this, just deleting all
		// existing records and inserting new without any guarentees that an update
		// won't fail part way through.
		await run(db, sql_delete_moderation_rules);

		for (let i = 0; i < new_rules.length; i++) {
			const rule = new_rules[i];
			await run(db, sql_insert_rule, {
				$source_url: rule.source_url,
				$pingback_rule: rule.pingback_rule,
				$webmention_rule: rule.webmention_rule,
				$notes: rule.notes,
			});
		}
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_delete_moderation_rules = sql(`
delete from moderation_rules
`);

const sql_insert_rule = sql(`
insert into moderation_rules
	(source_url, pingback_rule, webmention_rule, notes)
values
	($source_url, $pingback_rule, $webmention_rule, $notes)
`);
