
import { UserManager, UserData } from './users';
import { Settings, SettingsData } from './settings';
import { ColorThemeData, ColorThemeManager } from './color-themes';
import { TemplateManager, Templates } from './templates';
import { Feed } from './feed';

export abstract class Storage {
	protected abstract init() : Promise<void>;

	public abstract get_all_users() : Promise<UserData[]>;
	public abstract get_user(name: string) : Promise<UserData>;
	public abstract create_user(name: string, password_hash: string) : Promise<void>;
	public abstract delete_user(name: string) : Promise<void>;
	public abstract update_password(name: string, password_hash: string) : Promise<void>;
	// TODO: Add toggle_admin() method

	public abstract get_all_settings() : Promise<Partial<SettingsData>>;
	public abstract set_setting(name: string, value: any) : Promise<void>;
	
	public abstract get_all_color_themes() : Promise<Record<string, Partial<ColorThemeData>>>;
	public abstract set_color(theme_name: string, color_name: string, value: string) : Promise<void>;
	
	public abstract get_all_templates() : Promise<Partial<Templates>>;
	public abstract set_template(name: string, content: string) : Promise<void>;

	public readonly users = new UserManager();
	public readonly settings = new Settings();
	public readonly color_themes = new ColorThemeManager();
	public readonly templates = new TemplateManager();
	public readonly feed = new Feed();

	// ===== Setup =====

	public async setup() {
		await this.init();
		await this.users.load();
		await this.settings.load();
		await this.color_themes.load();
		await this.templates.load();
		// await this.feed.load();
	}
}
