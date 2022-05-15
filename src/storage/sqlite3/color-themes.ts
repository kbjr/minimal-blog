
import { conf } from '../../conf';
import * as sqlite3 from 'sqlite3';
import { ColorThemeData } from '../colors';
import { run, get_all, open, sql } from './db';

let db: sqlite3.Database;

export async function init() {
	const file = conf.data.sqlite3.settings_path;
	const mode = sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE;

	db = await open(file, mode);
	
	db.on('close', () => {
		db = null;
	});
}

interface ColorRow {
	theme_name: string;
	color_name: string;
	value: string;
}

export async function get_all_color_themes() {
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

const sql_get_themes = sql(`
select theme_name, color_name, value
from colors
`);

export async function set_color(theme_name: string, color_name: string, value: string) {
	await run(db, sql_set_color, {
		$theme_name: theme_name,
		$color_name: color_name,
		$value: value
	});
}

const sql_set_color = sql(`
insert into colors
	(theme_name, color_name, value)
values
	($theme_name, $color_name, $value)
on conflict (theme_name, color_name) do update
	set value = $value
`);
