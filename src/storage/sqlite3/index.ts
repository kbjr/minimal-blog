
import * as settings from './settings';
import * as color_themes from './color-themes';
import * as templates from './templates';
import { Storage } from '../storage';

export class Storage_sqlite3 extends Storage {
	constructor() {
		super();
	}

	protected async init() {
		await settings.init();
		await color_themes.init();
		await templates.init();
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
