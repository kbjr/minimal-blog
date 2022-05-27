
import * as sqlite3 from 'sqlite3';
// import { conf } from '../../../conf';
import { log_debug } from '../../../debug';
// import { promises as fs } from 'fs';
import { default_settings } from '../../default-settings';
import { run, sql, settings_pool, posts_pool } from '../db';

export async function build_v1() {
	log_debug('sqlite', `[sqlite]: Building initial v1 database...`);
	
	await Promise.all([
		settings_db.build(),
		posts_db.build(),
		// fs.mkdir(conf.data.sqlite3.attachments_path, 0o0700),
	]);

	log_debug('sqlite', `[sqlite]: Finished building v1 database`);
}



// ===== settings.db =====

namespace settings_db {
	export async function build() {
		const db = await settings_pool.acquire();

		try {
			await create_settings(db);
			await create_templates(db);
			await create_colors(db);
			await create_users(db);
			await create_mention_rules(db);
		}

		finally {
			await settings_pool.release(db);
		}
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
		create table if not exists colors (
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
		const db = await posts_pool.acquire();

		try {
			await create_post_types(db);
			await create_rsvp_types(db);
			await create_posts(db);
			await create_tags(db);
			await create_mentions(db);
			await create_attachments(db);
		}

		finally {
			await posts_pool.release(db);
		}
	}

	async function create_post_types(db: sqlite3.Database) {
		await run(db, sql_create_post_types);
		await run(db, sql_set_post_types);
	}

	const sql_create_post_types = sql(`
		create table if not exists post_types (
			name varchar(50) primary key
		)
	`);
	
	const sql_set_post_types = sql(`
		insert into post_types (name)
		values ('post'), ('comment'), ('note'), ('event'), ('rsvp')
	`);

	async function create_rsvp_types(db: sqlite3.Database) {
		await run(db, sql_create_rsvp_types);
		await run(db, sql_set_rsvp_types);
	}

	const sql_create_rsvp_types = sql(`
		create table if not exists rsvp_types (
			name varchar(50) primary key
		)
	`);
	
	const sql_set_rsvp_types = sql(`
		insert into rsvp_types (name)
		values ('yes'), ('no'), ('maybe'), ('interested')
	`);

	async function create_posts(db: sqlite3.Database) {
		await run(db, sql_create_posts);
	}

	const sql_create_posts = sql(`
		create table if not exists posts (
			post_id int unsigned auto_increment primary key,
			post_type varchar(50),
			uri_name varchar(1000),
			title varchar(255),
			subtitle varchar(255),
			external_url varchar(1000),
			content_html text,
			content_markdown text,
			image varchar(1000),
			banner_image varchar(1000),
			is_draft tinyint,
			date_published timestamp,
			date_updated timestamp,
			date_event_start timestamp,
			date_event_end timestamp,
			rsvp_type varchar(50),

			unique (post_type, uri_name),

			foreign key (post_type)
				references post_types (name),
			foreign key (rsvp_type)
				references rsvp_types (name)
		)
	`);

	async function create_tags(db: sqlite3.Database) {
		await run(db, sql_create_tags);
		await run(db, sql_create_tags_index);
	}

	const sql_create_tags = sql(`
		create table if not exists tags (
			tag_name varchar(50),
			post_id int unsigned,

			primary key (tag_name, post_id),

			foreign key (post_id)
				references posts (post_id)
		)
	`);
	
	const sql_create_tags_index = sql(`
		create index if not exists idx_tags_post_id
			on tags (post_id)
	`);

	async function create_mentions(db: sqlite3.Database) {
		await create_mention_types(db);
		await run(db, sql_create_mentions);
	}
	
	const sql_create_mentions = sql(`
		create table if not exists mentions (
			post_id int unsigned,
			source_url varchar(1000),
			vouch_url varchar(1000),
			needs_moderation tinyint,
			mention_type varchar(50),
			received_time timestamp,
			verified tinyint,

			primary key (post_id, source_url),

			foreign key (post_id)
				references posts (post_id)
			foreign key (mention_type)
				references mention_types (name)
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
		values ('webmention'), ('pingback')
	`);

	async function create_attachments(db: sqlite3.Database) {
		await run(db, sql_create_attachments);
	}

	const sql_create_attachments = sql(`
		create table if not exists attachments (
			post_id int unsigned,
			attachment_file varchar(50),
			title varchar(255),
			mime_type varchar(255),
			size_in_bytes int unsigned,
			duration_in_seconds int unsigned,

			primary key (post_id, attachment_file),

			foreign key (post_id)
				references posts (post_id)
		)
	`);
}
