
import { Templates } from '../templates';
import { run, get_all, sql, settings_pool } from './db';

interface TemplateRow {
	name: string;
	content: string;
}

export async function get_all_templates() {
	const db = await settings_pool.acquire();

	try {
		const rows = await get_all<TemplateRow>(db, sql_get_templates);
		const templates: Partial<Templates> = { };
		
		for (const row of rows) {
			templates[row.name] = row.content;
		}
	
		return templates;
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_get_templates = sql(`
select name, content
from templates
`);

export async function set_template(name: string, content: string) {
	const db = await settings_pool.acquire();

	try {
		await run(db, sql_set_template, {
			$name: name,
			$content: content,
		});
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_set_template = sql(`
insert into templates
	(name, content)
values
	($name, $content)
on conflict (name) do update
	set content = $content
`);
