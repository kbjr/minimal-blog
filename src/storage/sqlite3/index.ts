
import * as settings from './settings';
import * as color_themes from './color-themes';
import * as templates from './templates';
import * as posts from './posts';
import * as links from './links';
import * as mentions from './mentions';
import { Store } from '../store';
import { bring_db_schema_up_to_date } from './migrate';
import { create_backup } from './backup';
import { obj_frozen } from '../../util';
import { close_all } from './db';

export const store_sqlite3 = obj_frozen<Store>({
	init: bring_db_schema_up_to_date,
	backup: create_backup,
	shutdown: close_all,

	get_all_settings: settings.get_all_settings,
	set_setting: settings.set_setting,

	get_all_color_themes: color_themes.get_all_color_themes,
	set_color: color_themes.set_color,

	get_all_templates: templates.get_all_templates,
	set_template: templates.set_template,

	get_links: links.get_links,
	set_links: links.set_links,

	get_all_posts: posts.get_all_posts,
	search_posts: posts.search_posts,
	create_post: posts.create_post,
	update_post: posts.update_post,
	create_post_tags: posts.create_post_tags,
	delete_post_tags: posts.delete_post_tags,
	delete_post: posts.delete_post,
	move_post: posts.move_post,
	list_all_tags: posts.list_all_tags,

	get_all_mentions: mentions.get_all_mentions,

	// create_attachment: null,
	// read_attachment_streaming: null,
	// write_attachment_streaming: null,
	// delete_attachment: null,
});
