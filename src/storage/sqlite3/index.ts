
import * as users from './users';
import * as settings from './settings';
import * as color_themes from './color-themes';
import * as templates from './templates';
import * as posts from './posts';
import { Store } from '../store';
import { bring_db_schema_up_to_date } from './migrate';
import { create_backup } from './backup';
import { obj_frozen } from '../../util';
import { close_all } from './db';

export const store_sqlite3 = obj_frozen<Store>({
	init: bring_db_schema_up_to_date,
	backup: create_backup,
	shutdown: close_all,

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

	get_all_posts: posts.get_all_posts,
	get_post: posts.get_post,
	create_post: posts.create_post,
	update_post: posts.update_post,
	delete_post: posts.delete_post,
	move_post: posts.move_post,
	get_all_distinct_tags: posts.list_all_tags,

	// TODO: Interactions

	// create_attachment: null,
	// read_attachment_streaming: null,
	// write_attachment_streaming: null,
	// delete_attachment: null,
});
