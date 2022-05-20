
import { obj } from '../util';
import { SettingsData } from './settings';
import { default_dark, default_light } from './default-color-themes';

export const default_settings = obj<SettingsData>({
	version: 1,
	language: 'en',
	theme_light: default_light,
	theme_dark: default_dark,
	feed_title: 'Untitled',
	show_setup: true,
	https_only: true,
	send_pingback: false,
	send_webmention: false,
	receive_pingback: false,
	receive_webmention: false,
	default_pingback: 'review',
	default_webmention: 'review',
	author_name: 'Unknown Author',
	author_url: null,
	author_avatar: null,
});
