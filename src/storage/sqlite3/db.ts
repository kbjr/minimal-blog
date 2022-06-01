
import * as sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';
import { logger } from '../../debug';
import { createPool, Factory, Pool } from 'generic-pool';
import { conf } from '../../conf';

let next_conn_id = 1;
let next_query_id = 1;

const sqlite_log = logger('sqlite');
const sqlite_log_sql = logger('sqlite_sql');
const db_info = new WeakMap<sqlite3.Database, DBInfo>();

interface DBInfo {
	file: string;
	mode: number;
	connection_id: number;
	query_id?: number;
}

const posts_db_factory = db_factory(
	conf.data.sqlite3.posts_path,
	sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE
);

const settings_db_factory = db_factory(
	conf.data.sqlite3.settings_path,
	sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE
);

export const posts_pool = createPool(posts_db_factory, {
	min: conf.data.sqlite3.posts_pool_min,
	max: conf.data.sqlite3.posts_pool_max,
});

export const settings_pool = createPool(settings_db_factory, {
	min: conf.data.sqlite3.settings_pool_min,
	max: conf.data.sqlite3.settings_pool_max,
});

export async function close_all() {
	await Promise.all([
		close_pool(posts_pool),
		close_pool(settings_pool),
	]);
}

async function close_pool(pool: Pool<sqlite3.Database>) {
	await pool.drain();
	await pool.clear();
}

function db_factory(file: string, mode: number) : Factory<sqlite3.Database> {
	return {
		create() {
			return open(file, mode);
		},
		destroy(db: sqlite3.Database) {
			return close(db);
		}
	};
}

function open(file: string, mode: number) {
	const info = {
		connection_id: next_conn_id++,
		file,
		mode,
	};

	const log = sqlite_log.child(info);

	log.info('opening database connection...');

	return new Promise<sqlite3.Database>((resolve, reject) => {
		const db = new sqlite3.Database(file, mode, async (error) => {
			if (error) {
				return reject(error);
			}

			db_info.set(db, info);

			log.debug('database open');
			log.debug('confirming file permissions = 0600');
			
			// Ensure the file is not accessible to anyone but the server user
			await fs.chmod(file, 0o600);

			log.debug('enabling foreign keys');

			// Enable foreign keys
			await run(db, 'PRAGMA foreign_keys = ON');

			log.info('ready');
			resolve(db);
		});
	});
}

function close(db: sqlite3.Database) {
	const info = db_info.get(db);
	const log = sqlite_log.child(info as any);

	log.info('closing database connection...');

	return new Promise<void>((resolve, reject) => {
		db.close((error) => {
			if (error) {
				return reject(error);
			}

			log.info('closed', info);
			resolve();
		});
	});
}

export function sql(query: string) {
	return query.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

export function run(db: sqlite3.Database, query: string, params: any[] | object = [ ]) {
	const query_id = next_query_id++;
	const info = Object.assign({ query_id }, db_info.get(db));
	const log = sqlite_log.child(info as any);
	const log_sql = sqlite_log_sql.child(info as any);

	return new Promise<sqlite3.RunResult>((resolve, reject) => {
		log_sql.info(`run: ${query}`);

		db.run(query, params, function(error) {
			if (error) {
				log.error('run failed: ' + error.stack);
				return reject(error);
			}

			resolve(this);
		});
	});
}

export function get_one<T>(db: sqlite3.Database, query: string, params: any[] | object = [ ]) {
	const query_id = next_query_id++;
	const info = Object.assign({ query_id }, db_info.get(db));
	const log = sqlite_log.child(info as any);
	const log_sql = sqlite_log_sql.child(info as any);
	
	return new Promise<T>((resolve, reject) => {
		log_sql.info(`get_one: ${query}`);

		db.get(query, params, function(error, row) {
			if (error) {
				log.error('get_one failed: ' + error.stack);
				return reject(error);
			}

			resolve(row);
		});
	});
}

export function get_all<T>(db: sqlite3.Database, query: string, params: any[] | object = [ ]) {
	const query_id = next_query_id++;
	const info = Object.assign({ query_id }, db_info.get(db));
	const log = sqlite_log.child(info as any);
	const log_sql = sqlite_log_sql.child(info as any);
	
	return new Promise<T[]>((resolve, reject) => {
		log_sql.info(`get_all: ${query}`);

		db.all(query, params, function(error, rows) {
			if (error) {
				log.error('get_all failed: ' + error.stack);
				return reject(error);
			}

			resolve(rows);
		});
	});
}

export interface ListTablesRow {
	name: string;
}

export function list_tables(db: sqlite3.Database) {
	return get_all<ListTablesRow>(db, sql_list_tables);
}

const sql_list_tables = sql(`
select name from sqlite_schema
where type = 'table'
order by name
`);

export async function check_index_exists(db: sqlite3.Database, index: string) {
	const result = await get_one(db, sql_check_index_exists, [ index ]);
}

const sql_check_index_exists = sql(`
select count(*)
from sqlite_master
where type = 'index'
and name = ?
`);
