
import { Feed } from './feed';
import { conf } from '../conf';
import { EventEmitter } from 'events';
import { store_sqlite3 } from './sqlite3';

import * as users from './users';
import * as settings from './settings';
import * as colors from './colors';
import * as templates from './templates';
// import * as feed from './feed';

export let store: Store;

export * as users from './users';
export * as settings from './settings';
export * as colors from './colors';
export * as templates from './templates';
// export * as feed from './feed';

export let feed: Feed;

export const events = new EventEmitter();



// ===== Setup =====

export async function setup(no_update = false) {
	switch (conf.data.storage_type) {
		case conf.data.StorageType.sqlite3:
			store = store_sqlite3;
			break;
	
		default:
			throw new Error(`Invalid storage type "${conf.data.storage_type}" found in config`);
	}

	feed = new Feed();

	await store.init(no_update);
	await users.load();
	await settings.load();
	await colors.load();
	await templates.load();
	// await feed.load();

	events.emit('ready');
}



// ===== Store Interface =====

export interface Store {
	/**  */
	init(no_update?: boolean) : Promise<void>;

	/**  */
	get_all_users() : Promise<users.FullUserData[]>;

	/**  */
	get_user(name: string) : Promise<users.FullUserData>;

	/**  */
	create_user(name: string, password_hash: string, is_admin?: boolean) : Promise<void>;

	/**  */
	delete_user(name: string) : Promise<void>;

	/**  */
	update_password(name: string, password_hash: string) : Promise<void>;

	/**  */
	get_all_settings() : Promise<Partial<settings.SettingsData>>;

	/**  */
	set_setting(name: string, value: any) : Promise<void>;

	/**  */
	get_all_color_themes() : Promise<Record<string, Partial<colors.ColorThemeData>>>;

	/**  */
	set_color(theme_name: string, color_name: string, value: string) : Promise<void>;

	/**  */
	get_all_templates() : Promise<Partial<templates.Templates>>;

	/**  */
	set_template(name: string, content: string) : Promise<void>;

	/**  */
	backup() : Promise<void>;
}
