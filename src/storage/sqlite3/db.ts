
import * as sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';
import { debug_logger, log_debug } from '../../debug';

const db_files = new WeakMap<sqlite3.Database, string>();
const db_promises: Record<string, Promise<sqlite3.Database>> = { };

export function open(file: string, mode: number) {
	const log = debug_logger('sqlite', `[sqlite://${file}]: `);

	if (db_promises[file]) {
		log('Another client waiting for database to open...');
		return db_promises[file];
	}

	log('Opening database...');

	return db_promises[file] = new Promise((resolve, reject) => {
		const db = new sqlite3.Database(file, mode, async (error) => {
			if (error) {
				return reject(error);
			}

			db_files.set(db, file);

			log('Database open');
			log('Confirming file permissions = 0600');
			
			// Ensure the file is not accessible to anyone but the server user
			await fs.chmod(file, 0o600);

			log('Enabling foreign keys');

			// Enable foreign keys
			await run(db, `PRAGMA foreign_keys = ON`);

			db.on('close', () => {
				db_promises[file] = null;
			});

			log('Ready.');
			resolve(db);
		});
	});
}

export function close(db: sqlite3.Database) {
	return new Promise<void>((resolve, reject) => {
		db.close((error) => {
			if (error) {
				return reject(error);
			}

			resolve();
		});
	});
}

export function sql(query: string) {
	return query.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

export function run(db: sqlite3.Database, query: string, params: any[] | object = [ ]) {
	const log = debug_logger('sqlite_sql', `[sqlite://${db_files.get(db)}]: `);

	return new Promise<sqlite3.RunResult>((resolve, reject) => {
		log(`run(${query})`);

		db.run(query, params, function(error) {
			if (error) {
				return reject(error);
			}

			resolve(this);
		});
	});
}

export function get_one<T>(db: sqlite3.Database, query: string, params: any[] | object = [ ]) {
	const log = debug_logger('sqlite_sql', `[sqlite://${db_files.get(db)}]: `);

	return new Promise<T>((resolve, reject) => {
		log(`get_one(${query})`);

		db.get(query, params, function(error, row) {
			if (error) {
				return reject(error);
			}

			resolve(row);
		});
	});
}

export function get_all<T>(db: sqlite3.Database, query: string, params: any[] | object = [ ]) {
	const log = debug_logger('sqlite_sql', `[sqlite://${db_files.get(db)}]: `);

	return new Promise<T[]>((resolve, reject) => {
		log(`get_all(${query})`);

		db.all(query, params, function(error, rows) {
			if (error) {
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
