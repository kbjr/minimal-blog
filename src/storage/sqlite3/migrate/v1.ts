
import * as sqlite3 from 'sqlite3';
import { conf } from '../../../conf';
import { run, get_one, get_all, open, close, sql } from '../db';

export async function build_v1() {
	console.log('Building v1 sqlite3 datastore...');
	
	await Promise.all([
		settings_db.build(),
		posts_db.build(),
	]);

	console.log('Finished building v1 sqlite3 datastore.');
}



// ===== settings.db =====

namespace settings_db {
	export async function build() {
		const file = conf.data.sqlite3.settings_path;
		const mode = sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE;

		const db = await open(file, mode);

		await create_settings(db);
		await create_templates(db);
		await create_colors(db);
		await create_users(db);
		await create_mention_rules(db);
		
		await close(db);
	}

	async function create_settings(db: sqlite3.Database) {
		await run(db, sql_create_settings);
		await run(db, sql_set_default_settings);
	}

	const sql_create_settings = sql(`
		create table if not exists settings (
			name varchar(50) primary key,
			value any
		)
	`);
	
	const sql_set_default_settings = sql(`
		insert into settings
			(name, value)
		values
			('version',            0),
			('language',           'en'),
			('theme_light',        'Default (Light)'),
			('theme_dark',         'Default (Dark)'),
			('feed_title',         'Untitled'),
			('show_setup',         1),
			('https_only',         1),
			('send_pingback',      0),
			('send_webmention',    0),
			('receive_pingback',   0),
			('receive_webmention', 0),
			('default_pingback',   'review'),
			('default_webmention', 'review')
	`);

	async function create_templates(db: sqlite3.Database) {
		// await run(db, sql_create_templates);
	}

	async function create_colors(db: sqlite3.Database) {
		// await run(db, sql_create_colors);
	}

	async function create_users(db: sqlite3.Database) {
		// await run(db, sql_create_users);
	}

	async function create_mention_rules(db: sqlite3.Database) {
		await create_mention_types(db);
		await create_rule_types(db);
		await run(db, sql_create_mention_rules);
	}

	const sql_create_mention_rules = sql(`
		create table if not exists mention_rules (
			source_url varchar(1000) primary key,
			mention_type varchar(50),
			rule_type varchar(50),
			notes varchar(255),
			vouch_url varchar(1000),

			foreign key (mention_type)
				references mention_types (name),
			foreign key (rule_type)
				references rule_types (name)
		)
	`);
	
	async function create_mention_types(db: sqlite3.Database) {
		await run(db, sql_create_mention_types);
		await run(db, sql_set_mention_types);
	}

	const sql_create_mention_types = sql(`
		create table if not exists mention_types (
			name varchar(50) primary key
		)
	`);
	
	const sql_set_mention_types = sql(`
		insert into mention_types (name)
		values ('all'), ('webmention'), ('pingback')
	`);

	async function create_rule_types(db: sqlite3.Database) {
		await run(db, sql_create_rule_types);
		await run(db, sql_set_rule_types);
	}

	const sql_create_rule_types = sql(`
		create table if not exists rule_types (
			name varchar(50) primary key
		)
	`);
	
	const sql_set_rule_types = sql(`
		insert into rule_types (name)
		values ('block'), ('review'), ('allow'), ('trust')
	`);
}



// ===== posts.db =====

namespace posts_db {
	export async function build() {
		const file = conf.data.sqlite3.posts_path;
		const mode = sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE;

		const db = await open(file, mode);

		//
		
		await close(db);
	}
}
