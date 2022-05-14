
import { obj } from '../util';
import { SettingsData } from './settings';

export const default_settings = obj<SettingsData>({
	version: 1,
	language: 'en',
	theme_light: 'Default (Light)',
	theme_dark: 'Default (Dark)',
	feed_title: 'Untitled',
	show_setup: 1,
	https_only: 1,
	send_pingback: 0,
	send_webmention: 0,
	receive_pingback: 0,
	receive_webmention: 0,
	default_pingback: 'review',
	default_webmention: 'review',
});
