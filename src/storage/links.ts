
import { icons } from '../icons';
import { store, events } from './store';

let link_data: LinkData[];

export async function load() {
	link_data = await store.get_links();
	events.emit('links.load');
}

export function get_links() {
	return link_data.slice();
}

export async function set_links(new_links: LinkData[]) {
	await store.set_links(new_links);
	link_data = new_links.slice();
	events.emit('links.update');
}

export interface LinkData {
	link_url: string;
	label: string;
	icon: string;
	rel?: string;
}

export class Link {
	constructor(
		private readonly data: LinkData
	) { }

	public get link_url() {
		return this.data.link_url;
	}

	public get label() {
		return this.data.label;
	}

	public get icon() {
		return icons[this.data.icon];
	}

	public get rel() {
		return this.data.rel;
	}
}
