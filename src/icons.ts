
import { dict } from './util';
import * as feather from 'feather-icons';

export const icons = dict<string, string>();

const whitespace = /[\s\t\n]+/g;

for (const [name, { contents }] of Object.entries(feather.icons)) {
	icons[name] = `
	<svg xmlns="http://www.w3.org/2000/svg"
		class="icon ${name}"
		aria-hidden="true"
		style="width: var(--icon-size, 2.5rem); height: var(--icon-size, 2.5rem)"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>${contents}</svg>
	`.replace(whitespace, ' ').trim();
}

Object.freeze(icons);
