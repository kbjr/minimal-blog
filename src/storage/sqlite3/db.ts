
import * as sqlite3 from 'sqlite3';

const db_promises: Record<string, Promise<sqlite3.Database>> = { };

export function open(file: string, mode: number) {
	if (db_promises[file]) {
		return db_promises[file];
	}

	return db_promises[file] = new Promise((resolve, reject) => {
		const db = new sqlite3.Database(file, mode, async (error) => {
			if (error) {
				return reject(error);
			}

			db.on('close', () => {
				db_promises[file] = null;
			});

			resolve(db);
		});
	});
}

export function run(db: sqlite3.Database, query: string, params: any[] | object = [ ]) {
	return new Promise<sqlite3.RunResult>((resolve, reject) => {
		db.run(query, params, function(error) {
			if (error) {
				return reject(error);
			}

			resolve(this);
		});
	});
}

export function get_one<T>(db: sqlite3.Database, query: string, params: any[] | object = [ ]) {
	return new Promise<T>((resolve, reject) => {
		db.get(query, params, function(error, row) {
			if (error) {
				return reject(error);
			}

			resolve(row);
		});
	});
}

export function get_all<T>(db: sqlite3.Database, query: string, params: any[] | object = [ ]) {
	return new Promise<T[]>((resolve, reject) => {
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

const sql_list_tables = `
select name from sqlite_schema
where type = 'table'
order by name
`;
