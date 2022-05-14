
import * as sqlite3 from 'sqlite3';
import { conf } from '../../../conf';
import { run, open, close, sql } from '../db';
import { default_settings } from '../../default-settings';

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
		await set_default_settings(db);
	}

	const sql_create_settings = sql(`
		create table if not exists settings (
			name varchar(50) primary key,
			value any
		)
	`);

	async function set_default_settings(db: sqlite3.Database) {
		const entries = Object.entries(default_settings);
		const placeholders = entries.map(() => '(?, ?)').join(', ');
		const params = entries.flat();
		const sql_set_default_settings = sql(`
			insert into settings
				(name, value)
			values ${placeholders}
		`);

		await run(db, sql_set_default_settings, params);
	}
	
	async function create_templates(db: sqlite3.Database) {
		await run(db, sql_create_templates);
	}

	const sql_create_templates = sql(`
		create table if not exists templates (
			name varchar(50) primary key,
			content text
		)
	`);

	async function create_colors(db: sqlite3.Database) {
		await run(db, sql_create_colors);
	}

	const sql_create_colors = sql(`
		create table if not exists color_themes (
			theme_name varchar(50),
			color_name varchar(50),
			value varchar(50),
		
			primary key (theme_name, color_name)
		)
	`);

	async function create_users(db: sqlite3.Database) {
		await run(db, sql_create_users);
	}

	const sql_create_users = sql(`
		create table if not exists users (
			name varchar(50) primary key,
			password_hash varchar(255) not null,
			is_admin int not null
		)
	`);
	
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
