
import { conf } from '../../conf';
import * as sqlite3 from 'sqlite3';
import { run, get_one, get_all, open, sql } from './db';
import { PostData, AuthorData } from '../feed';

let db: sqlite3.Database;

export async function init() {
	const file = conf.data.sqlite3.posts_path;
	const mode = sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE;

	db = await open(file, mode);
	
	db.on('close', () => {
		db = null;
	});

	await create_posts();
	await create_tags();
	await create_authors();
	await create_post_authors();
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

export async function list_all_tags() {
	const rows = await get_all<{ tag_name: string }>(db, sql_list_all_tags);
	return rows.map((row) => row.tag_name);
}

const sql_list_all_tags = sql(`
select distinct tag_name
from tags
`);

export function create_posts() {
	return run(db, sql_create_posts);
}

const sql_create_posts = sql(`
create table if not exists posts (
	uri_name varchar(255) primary key,
	is_draft int,
	title varchar(255) not null,
	subtitle varchar(255),
	external_url varchar(2000),
	content_html text,
	content_markdown text,
	image varchar(2000),
	banner_image varchar(2000),
	date_published timestamp,
	date_modified timestamp
)
`);

export async function create_tags() {
	await run(db, sql_create_tags);
	await run(db, sql_create_tags_index);
}

const sql_create_tags = sql(`
create table if not exists tags (
	tag_name varchar(255),
	post_uri_name varchar(255),
	primary key (tag_name, post_uri_name),

	foreign key (post_uri_name)
		references posts (uri_name)
)
`);

const sql_create_tags_index = sql(`
create index if not exists idx_tags_post_uri_name
	on tags (post_uri_name)
`);

export function create_authors() {
	return run(db, sql_create_authors);
}

const sql_create_authors = sql(`
create table if not exists authors (
	id int auto increment,
	name varchar(255),
	url varchar(2000),
	avatar varchar(2000)
)
`);

export function create_post_authors() {
	return run(db, sql_create_post_authors);
}

const sql_create_post_authors = sql(`
create table if not exists post_authors (
	post_uri_name varchar(255),
	author_id int,
	primary key (post_uri_name, author_id),

	foreign key (post_uri_name)
		references posts (uri_name),
	foreign key (author_id)
		references authors (id)
)
`);
