
import { store, TemplateName } from './storage';
import { TemplateContext } from './storage/templates';

export class Cache<T> {
	private value: T;

	constructor(
		private render: () => T
	) { }

	public get_value() {
		if (this.value == null) {
			this.value = this.render();
		}

		return this.value;
	}

	public invalidate() {
		this.value = null;
	}
}

export function simple_template_cache(template_name: TemplateName) {
	const cache = new Cache(() => {
		const context = new TemplateContext(null);
		return store.templates.render(template_name, context);
	});

	store.settings.on('load', () => cache.invalidate());
	store.settings.on('update', () => cache.invalidate());
	store.color_themes.on('load', () => cache.invalidate());
	store.color_themes.on('update', () => cache.invalidate());
	store.templates.on('load', () => cache.invalidate());
	store.templates.on('update', () => cache.invalidate());

	return cache;
}
