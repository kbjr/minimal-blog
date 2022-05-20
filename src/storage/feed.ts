
import { store } from './store';
import { EventEmitter } from 'events';
import { conf } from '../conf';

export function get_url_html() {
	return `${conf.http.web_url}`;
}

export function get_url_json_feed() {
	return `${conf.http.web_url}/feed.json`;
}

export function get_url_rss() {
	return `${conf.http.web_url}/feed.rss.xml`;
}

export function get_url_atom() {
	return `${conf.http.web_url}/feed.atom.xml`;
}

export function send_pingback_enabled() {
	return false;
}

export function receive_pingback_enabled() {
	return false;
}

export function send_webmention_enabled() {
	return false;
}

export function receive_webmention_enabled() {
	return false;
}

export function get_url_pingback() {
	return `${conf.http.web_url}/pingback`;
}

export function get_url_webmention() {
	return `${conf.http.web_url}/webmention`;
}

export function get_url_webmention_trusted() {
	return `${conf.http.web_url}/webmention/trusted`;
}
