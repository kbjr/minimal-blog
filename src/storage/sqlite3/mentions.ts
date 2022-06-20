
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
	mention.verified         as verified
from mentions mention
left outer join posts post
	on post.post_id = mention.post_id
order by mention.received_time desc
`);

// export async function create_mention(new_mentions: MentionData[]) {
// 	const db = await posts_pool.acquire();
	
// 	try {
// 		// fixme: This is a pretty naive imlementation of this, just deleting all
// 		// existing records and inserting new without any guarentees that an update
// 		// won't fail part way through.
// 		await run(db, sql_delete_mentions);

// 		for (let i = 0; i < new_mentions.length; i++) {
// 			const mention = new_mentions[i];
// 			await run(db, sql_set_mention, {
// 				$mention_url: mention.mention_url,
// 				$label: mention.label,
// 				$icon: mention.icon,
// 				$sort_order: i + 1,
// 				$rel: mention.rel,
// 			});
// 		}
// 	}

// 	finally {
// 		await posts_pool.release(db);
// 	}
// }

// const sql_delete_mentions = sql(`
// delete from mentions
// `);

// const sql_set_mention = sql(`
// insert into mentions
// 	(mention_url, label, icon, sort_order, rel)
// values
// 	($mention_url, $label, $icon, $sort_order, $rel)
// `);
