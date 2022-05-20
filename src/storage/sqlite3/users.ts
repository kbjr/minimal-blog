
import { FullUserData } from '../users';
import { run, get_one, get_all, sql, settings_pool } from './db';

export interface UserRow {
	name: string;
	password_hash: string;
	is_admin: 1 | 0;
}

export async function get_all_users() {
	const db = await settings_pool.acquire();

	try {
		const rows = await get_all<UserRow>(db, sql_get_user);

		return rows.map((row) => {
			const mapped: FullUserData = row as any as FullUserData;
			mapped.is_admin = Boolean(row.is_admin);
			return mapped;
		});
	}

	finally {
		await settings_pool.release(db);
	}
}

export async function get_user(name: string) {
	const db = await settings_pool.acquire();

	try {
		const row = await get_one<UserRow>(db, sql_get_user + 'where name = ?', [ name ]);
		const mapped: FullUserData = row as any as FullUserData;
		mapped.is_admin = Boolean(row.is_admin);
		return mapped;
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_get_user = sql(`
select name, password_hash, is_admin
from users
`);

export async function create_user(name: string, password_hash: string, is_admin = false) {
	const db = await settings_pool.acquire();

	try {
		await run(db, sql_create_user, {
			$name: name,
			$password_hash: password_hash,
			$is_admin: is_admin ? 1 : 0
		});
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_create_user = sql(`
insert into users
	(name, password_hash, is_admin)
values
	($name, $password_hash, $is_admin)
`);

export async function delete_user(name: string) {
	const db = await settings_pool.acquire();

	try {
		await run(db, sql_delete_user, {
			$name: name
		});
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_delete_user = sql(`
delete from users
where name = $name
`);

export async function update_password(name: string, password_hash: string) {
	const db = await settings_pool.acquire();

	try {
		await run(db, sql_update_password, {
			$name: name,
			$password_hash: password_hash
		});
	}

	finally {
		await settings_pool.release(db);
	}
}

const sql_update_password = sql(`
update users
set password_hash = $password_hash
where name = $name
`);

// TODO: Add a toggle_admin() function
