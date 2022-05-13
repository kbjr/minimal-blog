
import * as users from './users';
import * as settings from './settings';
import * as color_themes from './color-themes';
import * as templates from './templates';
import * as posts from './posts';
import { Storage } from '../storage';
import { promises as fs, constants } from 'fs';
import { conf } from '../../conf';
import { log_debug } from '../../debug';

export class Storage_sqlite3 extends Storage {
	constructor() {
		super();
	}

	protected async init(no_update = false) {
		// TODO: Check version number in settings database
		// TODO: If version is out of date:
		// TODO:   - If `no_update` is set: crash
		// TODO:   - Create a backup of the database files
		// TODO:   - Do any database upgrade(s) needed

		await users.init();
		await settings.init();
		await color_themes.init();
		await templates.init();
		await posts.init();
	}

	public async backup() {
		const timestamp_suffix = (new Date).toISOString().replace(/[-:T]/g, '.').slice(0, -1);

		await Promise.all([
			backup_file(conf.data.sqlite3.settings_path),
			backup_file(conf.data.sqlite3.posts_path),
		]);

		async function backup_file(file: string) {
			log_debug('sqlite', `[sqlite://${file}]: Generating backup ${file}.bak.${timestamp_suffix}`);
			const new_file = `${file}.bak.${timestamp_suffix}`;
			await fs.copyFile(file, new_file, constants.COPYFILE_EXCL);
		}
	}

	public get_all_users() {
		return users.get_all_users();
	}

	public get_user(name: string) {
		return users.get_user(name);
	}

	public async create_user(name: string, password_hash: string, is_admin = false) : Promise<void> {
		await users.create_user(name, password_hash, is_admin ? 1 : 0);
	}

	public async delete_user(name: string) : Promise<void> {
		await users.delete_user(name);
	}

	public async update_password(name: string, password_hash: string) : Promise<void> {
		await users.update_password(name, password_hash);
	}

	public get_all_settings() {
		return settings.get_all_settings();
	}

	public async set_setting(name: string, value: any) {
		await settings.set_setting(name, value);
	}

	public get_all_color_themes() {
		return color_themes.get_all_color_themes();
	}

	public async set_color(theme_name: string, color_name: string, value: string) {
		await color_themes.set_color(theme_name, color_name, value);
	}

	public get_all_templates() {
		return templates.get_all_templates();
	}

	public async set_template(name: string, content: string) {
		await templates.set_template(name, content);
	}
}
