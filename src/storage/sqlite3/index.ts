
import * as users from './users';
import * as settings from './settings';
import * as color_themes from './color-themes';
import * as templates from './templates';
import * as posts from './posts';
import { Store } from '../store';
import { bring_db_schema_up_to_date } from './migrate';
import { create_backup } from './backup';
import { obj_frozen } from '../../util';

export const store_sqlite3 = obj_frozen<Store>({
	async init(no_update = false) {
		await bring_db_schema_up_to_date(no_update);
		await users.init();
		await settings.init();
		await color_themes.init();
		await templates.init();
		await posts.init();
	},

	backup: create_backup,

	get_all_users: users.get_all_users,
	get_user: users.get_user,
	create_user: users.create_user,
	delete_user: users.delete_user,
	update_password: users.update_password,

	get_all_settings: settings.get_all_settings,
	set_setting: settings.set_setting,

	get_all_color_themes: color_themes.get_all_color_themes,
	set_color: color_themes.set_color,

	get_all_templates: templates.get_all_templates,
	set_template: templates.set_template,
});
