
import { store } from './store';
import * as http_error from '../http-error';
import { verify_password, hash_password } from '../auth';

export class UserManager {
	private loaded = false;
	private users: UserData[];
	private users_by_name: Record<string, UserData>;

	public async load() {
		this.users = await store.get_all_users();
		this.users_by_name = Object.create(null);
		this.loaded = true;
	}

	public get all_users() {
		return this.users.map((user) => {
			return {
				name: user.name,
				is_admin: Boolean(user.is_admin)
			};
		});
	}

	public get_user(name: string) {
		if (! this.users_by_name[name]) {
			this.users_by_name[name] = this.users.find((user) => user.name === name);
		}

		return this.users_by_name[name];
	}

	public get no_users() {
		return this.loaded && this.users.length === 0;
	}

	public async verify_credentials(name: string, password: string) {
		const user = this.get_user(name);

		if (! user) {
			http_error.throw_401_not_authorized('Invalid credentials');
		}

		const is_valid = await verify_password(password, user.password_hash);

		if (! is_valid) {
			http_error.throw_401_not_authorized('Invalid credentials');
		}
	}

	public async create_user(name: string, password: string, is_admin = false) {
		if (this.get_user(name)) {
			http_error.throw_422_unprocessable_entity('Username already taken');
		}

		const new_user: UserData = {
			name,
			password_hash: null,
			is_admin,
		};

		this.users.push(new_user);
		this.users_by_name[name] = new_user;

		new_user.password_hash = await hash_password(password);
		await store.create_user(name, new_user.password_hash, is_admin);
	}

	public async update_password(name: string, new_password: string) {
		if (! this.get_user(name)) {
			http_error.throw_403_forbidden('Password update failed', 'Attempted to update password for user that does not exist');
		}

		// TODO: Validate password strength

		const new_hash = await hash_password(new_password);
		const user = this.get_user(name);

		if (! user) {
			http_error.throw_403_forbidden('Password update failed', 'User disappeared while we were hashing their password');
		}

		user.password_hash = new_hash;
		await store.update_password(name, new_hash);
	}

	public async delete_user(name: string) {
		for (let i = 0; i < this.users.length; i++) {
			if (this.users[i].name === name) {
				this.users.splice(i, 1);
				delete this.users_by_name[name];
				await store.delete_user(name);
				return;
			}
		}
	}
}

export interface UserData {
	name: string;
	password_hash: string;
	is_admin: boolean;
}
