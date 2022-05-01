
import { conf } from '../../conf';
import * as sqlite3 from 'sqlite3';
import { run, get_one, get_all, open } from './db';
import { Templates } from '../templates';

let db: sqlite3.Database;

export async function init() {
	const file = conf.data.sqlite3.settings_path;
	const mode = sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE;

	db = await open(file, mode);

	db.on('close', () => {
		db = null;
	});

	await create_templates();
}

interface TemplateRow {
	name: string;
	content: string;
}

export async function get_all_templates() {
	const rows = await get_all<TemplateRow>(db, sql_get_templates);
	const templates: Partial<Templates> = { };
	
	for (const row of rows) {
		templates[row.name] = row.content;
	}

	return templates;
}

const sql_get_templates = `
select name, content
from templates
`;

export async function set_template(name: string, content: string) {
	return run(db, sql_set_template, {
		$name: name,
		$content: content,
	});
}

const sql_set_template = `
insert into templates
	(name, content)
values
	($name, $content)
on conflict (name) do update
	set content = $content
`;

export function create_templates() {
	return run(db, sql_create_templates);
}

const sql_create_templates = `
create table if not exists templates (
	name varchar(50) primary key,
	content text
)
`;