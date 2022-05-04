
import { conf } from '../../conf';
import * as sqlite3 from 'sqlite3';
import { run, get_one, get_all, open, sql } from './db';
import { UserData } from '../users';

let db: sqlite3.Database;

export async function init() {
	const file = conf.data.sqlite3.settings_path;
	const mode = sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE;

	db = await open(file, mode);
	
	db.on('close', () => {
		db = null;
	});

	await create_users();
}

export interface UserRow {
	name: string;
	password_hash: string;
	is_admin: 1 | 0;
}

export async function get_all_users() {
	const rows = await get_all<UserRow>(db, sql_get_user);
	return rows.map((row) => {
		const mapped: UserData = row as any as UserData;
		mapped.is_admin = Boolean(row.is_admin);
		return mapped;
	});
}

export async function get_user(name: string) {
	const row = await get_one<UserRow>(db, sql_get_user + 'where name = ?', [ name ]);
	const mapped: UserData = row as any as UserData;
	mapped.is_admin = Boolean(row.is_admin);
	return mapped;
}

const sql_get_user = sql(`
select name, password_hash, is_admin
from users
`);

export async function create_user(name: string, password_hash: string, is_admin: 1 | 0 = 0) {
	return run(db, sql_create_user, {
		$name: name,
		$password_hash: password_hash,
		$is_admin: is_admin
	});
}

const sql_create_user = sql(`
insert into users
	(name, password_hash, is_admin)
values
	($name, $password_hash, $is_admin)
`);

export async function delete_user(name: string) {
	return run(db, sql_delete_user, {
		$name: name
	});
}

const sql_delete_user = sql(`
delete users
where name = $name
`);

export async function update_password(name: string, password_hash: string) {
	return run(db, sql_update_password, {
		$name: name,
		$password_hash: password_hash
	});
}

const sql_update_password = sql(`
update users
where name = $name
set password_hash = $password_hash
`);

// TODO: Add a toggle_admin() function

export function create_users() {
	return run(db, sql_create_users);
}

const sql_create_users = sql(`
create table if not exists users (
	name varchar(50) primary key,
	password_hash varchar(255) not null,
	is_admin int not null
)
`);
