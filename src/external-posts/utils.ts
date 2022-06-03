
import { JSDOM } from 'jsdom';
import type { MicroformatProperty } from 'microformats-parser/dist/types';

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
		if (Date.parse(prop0)) {
			return prop0;
		}
	}

	return null;
}

export function html_to_dom(url: string, html: string) {
	const { window } = new JSDOM(html, { url });
	return window;
}

export function take_first(raw: string | string[]) {
	return Array.isArray(raw) ? raw[0] : raw;
}
