
import { obj } from '../util';
import { conf } from '../conf';
import { store, events } from './store';
import { verify_password, hash_password } from '../auth';
import { calculate_password_complexity } from '../auth/password-complexity';
import { throw_401_not_authorized, throw_422_unprocessable_entity, throw_500_internal_server_error } from '../http-error';
import { LangCode } from '../endpoints/ctrl/ui/i18n';

export interface SettingsData {
	version: 1;
	language: string;
	favicon: Buffer;
	favicon_type: `image/${string}`;
	ctrl_panel_language: LangCode;
	password_hash: string;
	theme_light: string;
	theme_dark: string;
	feed_title: string;
	feed_description: string;
	show_setup: boolean;
	https_only: boolean;
	send_pingback: boolean;
	send_webmention: boolean;
	receive_pingback: boolean;
	receive_webmention: boolean;
	default_pingback: 'allow' | 'block' | 'review';
	default_webmention: 'allow' | 'block' | 'review';
	author_name: string;
	author_url: string;
	author_avatar: string;
	post_uri_format: 'slug' | 'snowflake';
	event_uri_format: 'slug' | 'snowflake';
	copyright_notice: string;
	show_tag_counts: boolean;
}

let data: Partial<SettingsData> = obj();

export async function load() {
	data = await store.get_all_settings();
	events.emit('settings.load');
}

const sensitive_settings_set = new Set<keyof SettingsData>([
	'password_hash',
	'show_setup',
]);

export async function set<K extends keyof SettingsData>(name: K, value: SettingsData[K], include_sensitive = false) {
	if (! include_sensitive && sensitive_settings_set.has(name)) {
		throw_500_internal_server_error(`Setting ${name} is sensitive`);
	}

	data[name] = value;
	await store.set_setting(name, value);
	events.emit('settings.update', name);
}

export function get<K extends keyof SettingsData>(name: K, include_sensitive = false) : SettingsData[K] {
	if (! include_sensitive && sensitive_settings_set.has(name)) {
		throw_500_internal_server_error(`Setting ${name} is sensitive`);
	}

	return data[name] as SettingsData[K];
}

export function get_all(include_sensitive = false) {
	const result = obj(data);

	if (! include_sensitive) {
		for (const name of sensitive_settings_set) {
			delete result[name];
		}
	}

	return result;
}



// ===== Setup / Credentials Stuff =====

export async function check_password(password: string) {
	const password_hash = get('password_hash', true);

	if (! password_hash) {
		throw_401_not_authorized('Invalid credentials');
	}

	const is_valid = await verify_password(password, password_hash);

	if (! is_valid) {
		throw_401_not_authorized('Invalid credentials');
	}
}

export async function setup_password(password: string, setup_code: string) {
	if (! conf.auth.setup_code) {
		throw_500_internal_server_error('setup_code not defined');
	}

	if (! setup_code || setup_code !== conf.auth.setup_code) {
		throw_401_not_authorized('invalid setup_code');
	}

	check_password_complexity(password);
	
	const new_hash = await hash_password(password);

	await set('password_hash', new_hash, true);
}

export async function update_password(new_password: string, current_password: string) {
	await check_password(current_password);
	check_password_complexity(new_password);
	
	const new_hash = await hash_password(new_password);

	await set('password_hash', new_hash, true);
}

function check_password_complexity(password: string) {
	const password_complexity = calculate_password_complexity(password);

	if (password_complexity.score < conf.auth.minimum_password_complexity) {
		const error = 'Password complexity too low; Try adding more length, and a wider mix of different types of characters';
		throw_422_unprocessable_entity(error, null, password_complexity);
	}
}
