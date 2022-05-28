
import { dict } from '../util';
import { store } from './store';
import * as http_error from '../http-error';
import { verify_password, hash_password } from '../auth';
import { calculate_password_complexity } from '../auth/password-complexity';
import { conf } from '../conf';

export interface UserData {
	name: string;
	is_admin: boolean;
}

export interface FullUserData extends UserData {
	password_hash: string;
}

let loaded = false;
let users: FullUserData[];
let users_by_name: Record<string, FullUserData>;

export async function load() {
	users = await store.get_all_users();
	users_by_name = dict();
	loaded = true;
}

export function get_all_users() {
	return users.map(clean_user);
}

export function get_user(name: string) {
	return clean_user(_get_user(name));
}

export function has_no_users() {
	return loaded && users.length === 0;
}

export async function verify_credentials(name: string, password: string) {
	const user = _get_user(name);

	if (! user) {
		http_error.throw_401_not_authorized('Invalid credentials');
	}

	const is_valid = await verify_password(password, user.password_hash);

	if (! is_valid) {
		http_error.throw_401_not_authorized('Invalid credentials');
	}
}

export async function create_user(name: string, password: string, is_admin = false) {
	if (_get_user(name)) {
		http_error.throw_422_unprocessable_entity('Username already taken');
	}

	const new_user: FullUserData = {
		name,
		password_hash: null,
		is_admin,
	};

	check_password_complexity(password);
	
	users.push(new_user);
	users_by_name[name] = new_user;

	new_user.password_hash = await hash_password(password);
	await store.create_user(name, new_user.password_hash, is_admin);
}

export async function update_password(name: string, new_password: string) {
	if (! _get_user(name)) {
		http_error.throw_403_forbidden('Password update failed', 'Attempted to update password for user that does not exist');
	}

	check_password_complexity(new_password);

	const new_hash = await hash_password(new_password);
	const user = _get_user(name);

	if (! user) {
		http_error.throw_403_forbidden('Password update failed', 'User disappeared while we were hashing their password');
	}

	user.password_hash = new_hash;
	await store.update_password(name, new_hash);
}

function check_password_complexity(password: string) {
	const password_complexity = calculate_password_complexity(password);

	if (password_complexity.score < conf.auth.minimum_password_complexity) {
		const error = 'Password complexity too low; Try adding more length, and a wider mix of different types of characters';
		http_error.throw_422_unprocessable_entity(error, null, password_complexity);
	}
}

export async function delete_user(name: string) {
	for (let i = 0; i < users.length; i++) {
		if (users[i].name === name) {
			users.splice(i, 1);
			delete users_by_name[name];
			await store.delete_user(name);
			return;
		}
	}
}

function _get_user(name: string) {
	if (! users_by_name[name]) {
		users_by_name[name] = users.find((user) => user.name === name);
	}

	return users_by_name[name];
}

/**
 * Mapping function that ensures a user object is safe to leave this
 * module (i.e. doesn't have any credentials information or the like
 * attached to it)
 */
function clean_user(user: FullUserData) : UserData {
	return {
		name: user.name,
		is_admin: user.is_admin
	};
}
