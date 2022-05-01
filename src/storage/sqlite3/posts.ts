
import { conf } from '../../conf';
import * as sqlite3 from 'sqlite3';
import { run, get_one, get_all, open } from './db';
import { SettingsData } from '../settings';

let db: sqlite3.Database;

export async function init() {
	const file = conf.data.sqlite3.posts_path;
	const mode = sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE;

	db = await open(file, mode);
	
	db.on('close', () => {
		db = null;
	});

	await create_posts();
}

// interface SettingRow<V = unknown> {
// 	name: string;
// 	value: V;
// }

// export async function get_all_settings() {
// 	const rows = await get_all<SettingRow>(db, sql_get_setting);
// 	const config: Partial<SettingsData> = { };
	
// 	for (const row of rows) {
// 		config[row.name] = row.value;
// 	}

// 	return config;
// }

// export async function get_setting(name: string) {
// 	const row = await get_one<SettingRow>(db, sql_get_setting + 'where name = ?', [ name ]);
// 	return row.value;
// }

// const sql_get_setting = `
// select name, value
// from posts
// `;

// export async function set_setting(name: string, value: any) {
// 	return run(db, sql_set_setting, {
// 		$name: name,
// 		$value: value
// 	});
// }

// const sql_set_setting = `
// insert into posts
// 	(name, value)
// values
// 	($name, $value)
// on conflict (name) do update
// 	set value = $value
// `;

export function create_posts() {
	return run(db, sql_create_posts);
}

const sql_create_posts = `
create table if not exists posts (
	uri_name varchar(255) primary key,
	title varchar(255) not null,
	subtitle varchar(255),
	html_content text
)
`;
