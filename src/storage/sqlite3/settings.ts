
import { SettingsData } from '../settings';
import { run, get_one, get_all, settings_pool, sql } from './db';

interface SettingRow<V = unknown> {
	name: string;
	value: V;
}

export async function get_all_settings() {
	const db = await settings_pool.acquire();

	try {
		const rows = await get_all<SettingRow>(db, sql_get_setting);
		const config: Partial<SettingsData> = { };
		
		for (const row of rows) {
			config[row.name] = row.value;
		}
	
		return config;
	}

	finally {
		await settings_pool.release(db);
	}
}

export async function get_setting(name: string) {
	const db = await settings_pool.acquire();

	try {
		const row = await get_one<SettingRow>(db, sql_get_setting + 'where name = ?', [ name ]);
		return row.value;
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_get_setting = sql(`
select name, value
from settings
`);

export async function set_setting(name: string, value: any) {
	const db = await settings_pool.acquire();

	try {
		await run(db, sql_set_setting, {
			$name: name,
			$value: value
		});
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_set_setting = sql(`
insert into settings
	(name, value)
values
	($name, $value)
on conflict (name) do update
	set value = $value
`);
