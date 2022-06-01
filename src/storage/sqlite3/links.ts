
import { LinkData } from '../links';
import { run, get_all, sql, settings_pool } from './db';

export async function get_links() {
	const db = await settings_pool.acquire();

	try {
		return await get_all<LinkData>(db, sql_get_links);
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_get_links = sql(`
select link_url, label, icon
from links
order by sort_order asc
`);

export async function set_links(new_links: LinkData[]) {
	const db = await settings_pool.acquire();
	
	try {
		// fixme: This is a pretty naive imlementation of this, just deleting all
		// existing records and inserting new without any guarentees that an update
		// won't fail part way through.
		await run(db, sql_delete_links);

		for (let i = 0; i < new_links.length; i++) {
			const link = new_links[i];
			await run(db, sql_set_link, {
				$link_url: link.link_url,
				$label: link.label,
				$icon: link.icon,
				$sort_order: i + 1
			});
		}
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_delete_links = sql(`
delete from links
`);

const sql_set_link = sql(`
insert into links
	(link_url, label, icon, sort_order)
values
	($link_url, $label, $icon, $sort_order)
`);
