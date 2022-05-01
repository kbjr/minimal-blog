
import { store } from './store';
import { EventEmitter } from 'events';
import { default_themes } from './defaults/color-themes';

export class ColorThemeManager extends EventEmitter {
	protected themes: Record<string, Partial<ColorThemeData>> = { };

	public async load() {
		this.themes = await store.get_all_color_themes();
		await this.populate_missing_colors_and_themes();
		this.emit('load');
	}

	public get light() {
		return this.themes[store.settings.theme_light];
	}

	public get dark() {
		return this.themes[store.settings.theme_dark];
	}

	public get_all() {
		const copy: Record<string, Partial<ColorThemeData>> = { };

		for (const [name, colors] of Object.entries(this.themes)) {
			copy[name] = Object.assign({ }, colors);
		}

		return copy;
	}

	private async populate_missing_colors_and_themes() {
		if (! this.themes.default_light) {
			this.themes.default_light = default_themes.default_light;
			await this.store_theme('default_light');
		}
		
		if (! this.themes.default_dark) {
			this.themes.default_dark = default_themes.default_dark;
			await this.store_theme('default_dark');
		}

		for (const [theme_name, colors] of Object.entries(this.themes)) {
			// TODO: Populate any missing colors in each theme
		}
	}

	private async store_theme(theme_name: string) {
		for (const [color_name, value] of Object.entries(this.themes[theme_name])) {
			await store.set_color(theme_name, color_name, value);
		}

		this.emit('update', theme_name);
	}
}

export const enum ColorName {
	sun                  = 'sun',
	moon                 = 'moon',
	bg_main              = 'bg_main',
	bg_light             = 'bg_light',
	bg_heavy             = 'bg_heavy',
	bg_accent            = 'bg_accent',
	line                 = 'line',
	text_heading         = 'text_heading',
	text_body            = 'text_body',
	text_light           = 'text_light',
	text_link            = 'text_link',
	text_link_active     = 'text_link_active',
	text_link_visited    = 'text_link_visited',
	code_normal          = 'code_normal',
	code_shadow          = 'code_shadow',
	code_background      = 'code_background',
	code_selection       = 'code_selection',
	code_comment         = 'code_comment',
	code_punc            = 'code_punc',
	code_operator        = 'code_operator',
	code_const_literal   = 'code_const_literal',
	code_number_literal  = 'code_number_literal',
	code_boolean_literal = 'code_boolean_literal',
	code_tag             = 'code_tag',
	code_string          = 'code_string',
	code_keyword         = 'code_keyword',
	code_func_name       = 'code_func_name',
	code_class_name      = 'code_class_name',
	code_regex_important = 'code_regex_important',
	code_variable        = 'code_variable',
	code_builtin         = 'code_builtin',
	code_attr_name       = 'code_attr_name',
	code_gutter_divider  = 'code_gutter_divider',
	code_line_number     = 'code_line_number',
	code_line_highlight  = 'code_line_highlight',
}

export interface ColorThemeData {
	/**  */
	sun: string;
	/**  */
	moon: string;
	/**  */
	bg_main: string;
	/**  */
	bg_light: string;
	/**  */
	bg_heavy: string;
	/**  */
	bg_accent: string;
	/**  */
	line: string;
	/**  */
	text_heading: string;
	/**  */
	text_body: string;
	/**  */
	text_light: string;
	/**  */
	text_link: string;
	/**  */
	text_link_active: string;
	/**  */
	text_link_visited: string;
	/**  */
	code_normal: string;
	/**  */
	code_shadow: string;
	/**  */
	code_background: string;
	/**  */
	code_selection: string;
	/**  */
	code_comment: string;
	/**  */
	code_punc: string;
	/**  */
	code_operator: string;
	/**  */
	code_const_literal: string;
	/**  */
	code_number_literal: string;
	/**  */
	code_boolean_literal: string;
	/**  */
	code_tag: string;
	/**  */
	code_string: string;
	/**  */
	code_keyword: string;
	/**  */
	code_func_name: string;
	/**  */
	code_class_name: string;
	/**  */
	code_regex_important: string;
	/**  */
	code_variable: string;
	/**  */
	code_builtin: string;
	/**  */
	code_attr_name: string;
	/**  */
	code_gutter_divider: string;
	/**  */
	code_line_number: string;
	/**  */
	code_line_highlight: string;
}
