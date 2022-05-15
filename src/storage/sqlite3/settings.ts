
import { conf } from '../../conf';
import * as sqlite3 from 'sqlite3';
import { run, get_one, get_all, open, sql } from './db';
import { SettingsData } from '../settings';

let db: sqlite3.Database;

export async function init() {
	const file = conf.data.sqlite3.settings_path;
	const mode = sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE;

	db = await open(file, mode);
	
	db.on('close', () => {
		db = null;
	});
}

interface SettingRow<V = unknown> {
	name: string;
	value: V;
}

export async function get_all_settings() {
	const rows = await get_all<SettingRow>(db, sql_get_setting);
	const config: Partial<SettingsData> = { };
	
	for (const row of rows) {
		config[row.name] = row.value;
	}

	return config;
}

export async function get_setting(name: string) {
	const row = await get_one<SettingRow>(db, sql_get_setting + 'where name = ?', [ name ]);
	return row.value;
}

const sql_get_setting = sql(`
select name, value
from settings
`);

export async function set_setting(name: string, value: any) {
	await run(db, sql_set_setting, {
		$name: name,
		$value: value
	});
}

const sql_set_setting = sql(`
insert into settings
	(name, value)
values
	($name, $value)
on conflict (name) do update
	set value = $value
`);
