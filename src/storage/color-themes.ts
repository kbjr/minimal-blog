
import { store } from './store';
import { EventEmitter } from 'events';
import { default_themes } from './default-color-themes';

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

	public get default_light() {
		return this.themes.default_light;
	}

	public get default_dark() {
		return this.themes.default_dark;
	}

	public exists(theme_name: string) {
		return this.themes[theme_name] != null;
	}

	public get_all() {
		const copy: Record<string, Partial<ColorThemeData>> = { };

		for (const [name, colors] of Object.entries(this.themes)) {
			copy[name] = Object.assign({ }, colors);
		}

		return copy;
	}

	public create_theme(theme_name: string, base_name?: string) {
		const theme = base_name
			? Object.assign({ }, this.themes[base_name])
			: { };

		for (const name of color_names) {
			if (! theme[name]) {
				theme[name] = 'transparent';
			}
		}

		this.themes[theme_name] = theme;
		return this.store_theme(theme_name);
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
			let updated = false;

			for (const name of color_names) {
				if (! colors[name]) {
					updated = true;
					colors[name] = 'transparent';
				}
			}

			if (updated) {
				await this.store_theme(theme_name);
			}
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
	sun                   = 'sun',
	moon                  = 'moon',
	bg_main               = 'bg_main',
	bg_light              = 'bg_light',
	bg_heavy              = 'bg_heavy',
	bg_accent             = 'bg_accent',
	line                  = 'line',
	text_heading          = 'text_heading',
	text_body             = 'text_body',
	text_light            = 'text_light',
	text_link             = 'text_link',
	text_link_active      = 'text_link_active',
	text_link_visited     = 'text_link_visited',
	bg_button_primary     = 'bg_button_primary',
	text_button_primary   = 'text_button_primary',
	bg_button_secondary   = 'bg_button_secondary',
	text_button_secondary = 'text_button_secondary',
	border_input          = 'border_input',
	border_input_invalid  = 'border_input_invalid',
	code_normal           = 'code_normal',
	code_shadow           = 'code_shadow',
	code_background       = 'code_background',
	code_selection        = 'code_selection',
	code_comment          = 'code_comment',
	code_punc             = 'code_punc',
	code_operator         = 'code_operator',
	code_const_literal    = 'code_const_literal',
	code_number_literal   = 'code_number_literal',
	code_boolean_literal  = 'code_boolean_literal',
	code_tag              = 'code_tag',
	code_string           = 'code_string',
	code_keyword          = 'code_keyword',
	code_func_name        = 'code_func_name',
	code_class_name       = 'code_class_name',
	code_regex_important  = 'code_regex_important',
	code_variable         = 'code_variable',
	code_builtin          = 'code_builtin',
	code_attr_name        = 'code_attr_name',
	code_gutter_divider   = 'code_gutter_divider',
	code_line_number      = 'code_line_number',
	code_line_highlight   = 'code_line_highlight',
}

export type ColorThemeData = Record<ColorName, string>;

export const color_names = [
	ColorName.sun,
	ColorName.moon,
	ColorName.bg_main,
	ColorName.bg_light,
	ColorName.bg_heavy,
	ColorName.bg_accent,
	ColorName.line,
	ColorName.text_heading,
	ColorName.text_body,
	ColorName.text_light,
	ColorName.text_link,
	ColorName.text_link_active,
	ColorName.text_link_visited,
	ColorName.bg_button_primary,
	ColorName.text_button_primary,
	ColorName.bg_button_secondary,
	ColorName.text_button_secondary,
	ColorName.border_input,
	ColorName.border_input_invalid,
	ColorName.code_normal,
	ColorName.code_shadow,
	ColorName.code_background,
	ColorName.code_selection,
	ColorName.code_comment,
	ColorName.code_punc,
	ColorName.code_operator,
	ColorName.code_const_literal,
	ColorName.code_number_literal,
	ColorName.code_boolean_literal,
	ColorName.code_tag,
	ColorName.code_string,
	ColorName.code_keyword,
	ColorName.code_func_name,
	ColorName.code_class_name,
	ColorName.code_regex_important,
	ColorName.code_variable,
	ColorName.code_builtin,
	ColorName.code_attr_name,
	ColorName.code_gutter_divider,
	ColorName.code_line_number,
	ColorName.code_line_highlight,
];
