
import { ColorThemeData } from '../colors';
import { run, get_all, sql, settings_pool } from './db';

interface ColorRow {
	theme_name: string;
	color_name: string;
	value: string;
}

export async function get_all_color_themes() {
	const db = await settings_pool.acquire();

	try {
		const rows = await get_all<ColorRow>(db, sql_get_themes);
		const themes: Record<string, Partial<ColorThemeData>> = { };
		
		for (const row of rows) {
			if (! themes[row.theme_name]) {
				themes[row.theme_name] = { };
			}
	
			themes[row.theme_name][row.color_name] = row.value;
		}
	
		return themes;
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_get_themes = sql(`
select theme_name, color_name, value
from colors
`);

export async function set_color(theme_name: string, color_name: string, value: string) {
	const db = await settings_pool.acquire();

	try {
		await run(db, sql_set_color, {
			$theme_name: theme_name,
			$color_name: color_name,
			$value: value
		});
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_set_color = sql(`
insert into colors
	(theme_name, color_name, value)
values
	($theme_name, $color_name, $value)
on conflict (theme_name, color_name) do update
	set value = $value
`);
