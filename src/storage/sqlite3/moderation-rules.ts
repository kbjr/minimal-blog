
import { MentionData } from '../mentions';
import { run, get_all, sql, posts_pool } from './db';

type MentionDataRow = Omit<MentionData, 'needs_moderation' | 'verified'> & {
	post_id: number;
	needs_moderation: 0 | 1;
	verified: 0 | 1;
};

export async function get_all_mentions() {
	const db = await posts_pool.acquire();

	try {
		const rows = await get_all<MentionDataRow>(db, sql_get_mentions);
		return rows.map((row) : MentionData => {
			return Object.assign(row, {
				needs_moderation: !! row.needs_moderation,
				verified: !! row.verified,
			});
		});
	}

	finally {
		await posts_pool.release(db);
	}
}

const sql_get_mentions = sql(`
select
	mention.post_id          as post_id,
	post.post_type           as post_type,
	post.uri_name            as uri_name,
	mention.source_url       as source_url,
	mention.vouch_url        as vouch_url,
	mention.snowflake        as snowflake,
	mention.needs_moderation as needs_moderation,
	mention.mention_type     as mention_type,
	mention.received_time    as received_time,
	mention.verified         as verified,
	mention.blocked          as blocked
from mentions mention
left outer join posts post
	on post.post_id = mention.post_id
order by mention.received_time desc
`);
