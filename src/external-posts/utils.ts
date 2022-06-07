
import { JSDOM } from 'jsdom';
import { conf } from '../conf';
import { sanitize_html } from '../html-sanitize';
import { MicroformatProperty } from './parse';

export function mf2_extract_str(prop: MicroformatProperty[]) {
	if (! prop || ! prop.length) {
		return null;
	}

	const prop0 = prop[0];

	if (typeof prop0 === 'string') {
		return prop0;
	}

	if ('html' in prop0) {
		return prop0.value;
	}

	if ('type' in prop0) {
		// todo: what do we want to do here?
	}
}

export function mf2_extract_date(prop: MicroformatProperty[]) {
	if (! prop || ! prop.length) {
		return null;
	}

	const prop0 = prop[0];

	if (typeof prop0 === 'string') {
		return as_date(prop0);
	}

	return null;
}

export function mf2_extract_html(prop: MicroformatProperty[]) {
	if (! prop || ! prop.length) {
		return null;
	}

	const prop0 = prop[0];

	if (typeof prop0 === 'string') {
		return prop0;
	}

	if ('html' in prop0) {
		return sanitize_html(prop0.html);
	}
}

export function html_to_dom(url: string, html: string) {
	const { window } = new JSDOM(html, { url });
	return window;
}

export function take_first(raw: string | string[]) {
	return Array.isArray(raw) ? raw[0] : raw;
}

export function as_date(date_str: string) {
	const parsed = Date.parse(date_str);

	if (parsed) {
		return new Date(parsed);
	}
}

export function truncate_str(str: string, max: number, trim_to: number) {
	return str.length > max ? str.slice(0, trim_to) + '…' : str;
}
