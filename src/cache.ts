
import { store } from './storage';
import { TemplateContext } from './storage/templates';
import { load_asset } from './storage/assets';
import { render } from 'mustache';

export interface ExpirationTriggers {
	settings?: boolean;
	color_themes?: boolean;
	templates?: boolean;
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

export function rendered_template_cache(template: string, context: TemplateContext, partials: Record<string, string>, triggers: ExpirationTriggers = { }) {
	let cache: string;
	set_invalidate_triggers(invalidate, triggers);

	function invalidate() {
		cache = void 0;
	}

	function render_template() {
		return store.templates.render(template, context, partials);
	}

	return async function() {
		if (cache) {
			return cache;
		}

		return cache = await render_template();
	}
}

function set_invalidate_triggers(invalidate: () => void, triggers: ExpirationTriggers) {
	if (triggers.settings) {
		store.settings.on('load', invalidate);
		store.settings.on('update', invalidate);
	}

	if (triggers.color_themes) {
		store.colors.on('load', invalidate);
		store.colors.on('update', invalidate);
	}

	if (triggers.templates) {
		store.templates.on('load', invalidate);
		store.templates.on('update', invalidate);
	}
}
