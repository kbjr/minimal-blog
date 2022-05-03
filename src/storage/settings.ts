
import { store } from './store';
import { EventEmitter } from 'events';

export interface SettingsData {
	version: 1;
	language: string;
	theme_light: string;
	theme_dark: string;
	feed_title: string;
	show_setup: 1 | 0;
	// ...
}

export class Settings extends EventEmitter {
	private data: Partial<SettingsData> = { };

	public async load() {
		this.data = await store.get_all_settings();
		await this.populate_missing_settings();
		this.emit('load');
	}

	/** Populates any missing settings with default values */
	private async populate_missing_settings() {
		if (this.data.version == null) {
			await this.set_version(1);
		}

		if (this.data.language == null) {
			await this.set_language('en');
		}

		if (this.data.theme_light == null) {
			await this.set_theme_light('default_light');
		}

		if (this.data.theme_dark == null) {
			await this.set_theme_dark('default_dark');
		}

		if (this.data.feed_title == null) {
			await this.set_feed_title('Untitled Feed');
		}

		if (this.data.show_setup == null) {
			await this.set_show_setup(1);
		}

		// ...
	}

	public get_all() {
		return Object.assign({ }, this.data);
	}

	public get version() {
		return this.data.version;
	}

	public async set_version(value: 1) {
		this.data.version = value;
		await store.set_setting('version', value);
		this.emit('update', 'version');
	}

	public get language() {
		return this.data.language;
	}

	public async set_language(value: string) {
		this.data.language = value;
		await store.set_setting('language', value);
		this.emit('update', 'language');
	}

	public get theme_light() {
		return this.data.theme_light;
	}

	public async set_theme_light(value: string) {
		this.data.theme_light = value;
		await store.set_setting('theme_light', value);
		this.emit('update', 'theme_light');
	}

	public get theme_dark() {
		return this.data.theme_dark;
	}

	public async set_theme_dark(value: string) {
		this.data.theme_dark = value;
		await store.set_setting('theme_dark', value);
		this.emit('update', 'theme_dark');
	}

	public get feed_title() {
		return this.data.feed_title;
	}

	public async set_feed_title(value: string) {
		this.data.feed_title = value;
		await store.set_setting('feed_title', value);
		this.emit('update', 'feed_title');
	}

	public get show_setup() {
		return this.data.show_setup;
	}

	public async set_show_setup(value: 1 | 0) {
		this.data.show_setup = value;
		await store.set_setting('show_setup', value);
		this.emit('update', 'show_setup');
	}

	// ...
}
