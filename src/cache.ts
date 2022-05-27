
import { store } from './storage';
import { TemplateContext } from './storage/templates';
import { load_asset } from './storage/assets';
import { render } from 'mustache';

export interface ExpirationTriggers {
	settings?: boolean;
	colors?: boolean;
	templates?: boolean;
	feed?: boolean;
	posts?: boolean;
}

export function rendered_asset_cache(asset: string, context: object, partials: Record<string, string>, triggers: ExpirationTriggers = { }) {
	let cache: string;
	set_invalidate_triggers(invalidate, triggers);

	function invalidate() {
		cache = void 0;
	}

	async function render_asset() {
		const raw = await load_asset(asset);
		return render(raw, context, partials);
	}

	return async function() {
		if (cache) {
			return cache;
		}

		return cache = await render_asset();
	}
}

export function rendered_template_cache(template: string, get_context: () => Promise<TemplateContext>, partials: Record<string, string>, triggers: ExpirationTriggers = { }) {
	let cache: string;
	set_invalidate_triggers(invalidate, triggers);

	function invalidate() {
		cache = void 0;
	}

	async function render_template() {
		const context = await get_context();
		return store.templates.render(template, context, partials);
	}

	return async function() {
		if (cache) {
			return cache;
		}

		return cache = await render_template();
	}
}

export function custom_cache(func: () => Promise<string>, triggers: ExpirationTriggers = { }) {
	let cache: string;
	set_invalidate_triggers(invalidate, triggers);

	function invalidate() {
		cache = void 0;
	}

	return async function() {
		if (cache) {
			return cache;
		}

		return cache = await func();
	}
}

function set_invalidate_triggers(invalidate: () => void, triggers: ExpirationTriggers) {
	if (triggers.settings) {
		store.events.on('settings.load', invalidate);
		store.events.on('settings.update', invalidate);
	}

	if (triggers.colors) {
		store.events.on('colors.load', invalidate);
		store.events.on('colors.update', invalidate);
	}

	if (triggers.templates) {
		store.events.on('templates.load', invalidate);
		store.events.on('templates.update', invalidate);
	}

	if (triggers.feed) {
		store.events.on('feed.load', invalidate);
		store.events.on('feed.update', invalidate);
	}

	if (triggers.posts) {
		store.events.on('posts.create', invalidate);
		store.events.on('posts.update', invalidate);
	}
}
