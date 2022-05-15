
import { obj } from '../util';
import { store, events } from './store';

export interface SettingsData {
	version: 1;
	language: string;
	theme_light: string;
	theme_dark: string;
	feed_title: string;
	show_setup: boolean;
	https_only: boolean;
	send_pingback: boolean;
	send_webmention: boolean;
	receive_pingback: boolean;
	receive_webmention: boolean;
	default_pingback: 'allow' | 'block' | 'review';
	default_webmention: 'allow' | 'block' | 'review';
}

let data: Partial<SettingsData> = obj();

export async function load() {
	data = await store.get_all_settings();
	events.emit('settings.load');
}

export async function set<K extends keyof SettingsData>(name: K, value: SettingsData[K]) {
	data[name] = value;
	await store.set_setting(name, value);
	events.emit('settings.update', name);
}

export function get<K extends keyof SettingsData>(name: K) : SettingsData[K] {
	return data[name] as SettingsData[K];
}

export function get_all() {
	return obj(data);
}
