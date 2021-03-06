
import { dict } from '../util';
import { store, settings, events } from './store';
import { default_themes, default_light, default_dark } from './default-color-themes';

type Themes = Record<string, Partial<ColorThemeData>>;
let themes: Themes;

export async function load() {
	themes = await store.get_all_color_themes();
	themes[default_light] = default_themes[default_light];
	themes[default_dark] = default_themes[default_dark];
	events.emit('colors.load');
}

export function get_light() {
	return themes[settings.get('theme_light')] || get_default_light();
}

export function get_dark() {
	return themes[settings.get('theme_dark')] || get_default_dark();
}

export function get_default_light() {
	return themes[default_light];
}

export function get_default_dark() {
	return themes[default_dark];
}

export function exists(theme_name: string) {
	return themes[theme_name] != null;
}

export function get(theme_name: string) {
	if (exists(theme_name)) {
		return Object.assign(Object.create(null), themes[theme_name]);
	}
}

export function get_all() {
	const copy: Themes = dict();

	for (const [name, colors] of Object.entries(themes)) {
		copy[name] = Object.assign(Object.create(null), colors);
	}

	return copy;
}

export function create_theme(theme_name: string, base_name?: string) {
	if (exists(theme_name)) {
		throw new Error('Theme with the given name already exists');
	}

	const theme = base_name
		? Object.assign(Object.create(null), themes[base_name])
		: { };

	delete theme.$builtin;

	for (const name of color_names) {
		if (! theme[name]) {
			theme[name] = '#000000';
		}
	}

	themes[theme_name] = theme;
	return store_theme(theme_name);
}

async function store_theme(theme_name: string) {
	if (themes[theme_name].$builtin) {
		throw new Error('Should not be attempting to store a built-in theme');
	}

	for (const [color_name, value] of Object.entries(themes[theme_name])) {
		if (color_name !== '$builtin') {
			await store.set_color(theme_name, color_name, value as string);
		}
	}

	events.emit('colors.update', theme_name);
}

export const enum ColorName {
	sun                       = 'sun',
	moon                      = 'moon',
	bg_main                   = 'bg_main',
	bg_light                  = 'bg_light',
	bg_heavy                  = 'bg_heavy',
	line                      = 'line',
	text_heading              = 'text_heading',
	text_body                 = 'text_body',
	text_light                = 'text_light',
	text_link                 = 'text_link',
	text_link_active          = 'text_link_active',
	text_link_visited         = 'text_link_visited',
	text_highlight            = 'text_highlight',
	bg_text_highlight         = 'bg_text_highlight',
	text_selection            = 'text_selection',
	bg_text_selection         = 'bg_text_selection',
	bg_button_primary         = 'bg_button_primary',
	bg_button_primary_hover   = 'bg_button_primary_hover',
	text_button_primary       = 'text_button_primary',
	bg_button_secondary       = 'bg_button_secondary',
	bg_button_secondary_hover = 'bg_button_secondary_hover',
	text_button_secondary     = 'text_button_secondary',
	bg_input                  = 'bg_input',
	border_input              = 'border_input',
	border_input_invalid      = 'border_input_invalid',
	icon_active_indicator     = 'icon_active_indicator',
	icon_success_indicator    = 'icon_success_indicator',
	icon_failure_indicator    = 'icon_failure_indicator',
	icon_warning_indicator    = 'icon_warning_indicator',
	code_normal               = 'code_normal',
	code_shadow               = 'code_shadow',
	code_background           = 'code_background',
	code_selection            = 'code_selection',
	code_comment              = 'code_comment',
	code_punc                 = 'code_punc',
	code_operator             = 'code_operator',
	code_const_literal        = 'code_const_literal',
	code_number_literal       = 'code_number_literal',
	code_boolean_literal      = 'code_boolean_literal',
	code_tag                  = 'code_tag',
	code_string               = 'code_string',
	code_keyword              = 'code_keyword',
	code_func_name            = 'code_func_name',
	code_class_name           = 'code_class_name',
	code_regex_important      = 'code_regex_important',
	code_variable             = 'code_variable',
	code_builtin              = 'code_builtin',
	code_attr_name            = 'code_attr_name',
	code_gutter_divider       = 'code_gutter_divider',
	code_line_number          = 'code_line_number',
	code_line_highlight       = 'code_line_highlight',
}

export type ColorThemeData = Record<ColorName, string> & {
	$builtin?: boolean;
};

export const color_names = [
	ColorName.sun,
	ColorName.moon,
	ColorName.bg_main,
	ColorName.bg_light,
	ColorName.bg_heavy,
	ColorName.line,
	ColorName.text_heading,
	ColorName.text_body,
	ColorName.text_light,
	ColorName.text_link,
	ColorName.text_link_active,
	ColorName.text_link_visited,
	ColorName.text_highlight,
	ColorName.bg_text_highlight,
	ColorName.text_selection,
	ColorName.bg_text_selection,
	ColorName.bg_button_primary,
	ColorName.bg_button_primary_hover,
	ColorName.text_button_primary,
	ColorName.bg_button_secondary,
	ColorName.bg_button_secondary_hover,
	ColorName.text_button_secondary,
	ColorName.bg_input,
	ColorName.border_input,
	ColorName.border_input_invalid,
	ColorName.icon_active_indicator,
	ColorName.icon_success_indicator,
	ColorName.icon_failure_indicator,
	ColorName.icon_warning_indicator,
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
