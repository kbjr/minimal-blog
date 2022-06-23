
import { conf } from '../conf';
import { EventEmitter } from 'events';
import { store_sqlite3 } from './sqlite3';
import * as settings from './settings';
import * as colors from './colors';
import * as templates from './templates';
import * as posts from './posts';
import * as links from './links';
import * as mentions from './mentions';

export let store: Store;
export const events = new EventEmitter();

events.setMaxListeners(15);

export * as feed from './feed';
export * as settings from './settings';
export * as colors from './colors';
export * as templates from './templates';
export * as posts from './posts';
export * as links from './links';
export * as mentions from './mentions';



// ===== Setup =====

export async function setup(no_update = false) {
	if (store) {
		throw new Error('Cannot setup store twice');
	}

	switch (conf.data.storage_type) {
		case conf.data.StorageType.sqlite3:
			store = store_sqlite3;
			break;
	
		default:
			throw new Error(`Invalid storage type "${conf.data.storage_type}" found in config`);
	}

	await store.init(no_update);
	await settings.load();
	await colors.load();
	await templates.load();
	await links.load();
	await posts.load();
	await mentions.load();

	events.emit('ready');
}



// ===== Store Interface =====

export interface Store {
	/**  */
	init(no_update?: boolean) : Promise<void>;

	/**  */
	backup() : Promise<void>;

	/**  */
	shutdown() : Promise<void>;

	// ===== Settings =====

	/**  */
	get_all_settings() : Promise<Partial<settings.SettingsData>>;

	/**  */
	set_setting(name: string, value: any) : Promise<void>;

	// ===== Color Themes =====

	/**  */
	get_all_color_themes() : Promise<Record<string, Partial<colors.ColorThemeData>>>;

	/**  */
	set_color(theme_name: string, color_name: string, value: string) : Promise<void>;

	// ===== Templates =====

	/**  */
	get_all_templates() : Promise<Partial<templates.Templates>>;

	/**  */
	set_template(name: string, content: string) : Promise<void>;

	// ===== Links =====

	/**  */
	get_links() : Promise<links.LinkData[]>;

	/**  */
	set_links(new_links: links.LinkData[]): Promise<void>;

	// ===== Posts =====

	/**  */
	get_all_posts() : Promise<posts.PostData[]>;

	/**  */
	get_post(uri_name: string) : Promise<posts.PostData>;

	/*  */
	search_posts(query: string) : Promise<posts.SearchResult[]>;

	/**  */
	create_post(data: posts.PostDataPatch) : Promise<posts.PostData>;

	/**  */
	update_post(data: posts.PostData) : Promise<void>;

	/**  */
	create_post_tags(post_id: number, tags: string[]) : Promise<void>;

	/**  */
	delete_post_tags(post_id: number, tags: string[]) : Promise<void>;

	/**  */
	delete_post(uri_name: string) : Promise<void>;

	/**  */
	move_post(old_uri_name: string, new_uri_name: string) : Promise<void>;

	/**  */
	list_all_tags() : Promise<posts.TagData[]>;

	// ===== Mentions =====

	get_all_mentions() : Promise<mentions.MentionData[]>;

	// ===== Attachments =====

	// /**  */
	// create_attachment(data: posts.AttachmentData) : Promise<void>;

	// /**  */
	// read_attachment_streaming(uri_name: string, attachment_file: string, write_to: WritableStream) : Promise<void>;

	// /**  */
	// write_attachment_streaming(uri_name: string, attachment_file: string, read_from: ReadableStream) : Promise<void>;

	// /**  */
	// delete_attachment(uri_name: string, attachment_file: string) : Promise<void>;

}
