
import { store, TemplateName } from './storage';
import { TemplateContext } from './storage/templates';
import { debug_logger } from './debug';

export class Cache<T> {
	private value: T;
	private log = debug_logger('cache', `[cache:${this.name}]: `);

	constructor(
		private name: string,
		private render: () => T
	) { }

	public get_value() {
		if (this.value == null) {
			this.log('render');
			this.value = this.render();
		}

		return this.value;
	}

	public invalidate() {
		this.log('invalidate');
		this.value = null;
	}
}

export function template_cache(template_name: TemplateName, partials: Record<string, string>, context: TemplateContext) {
	const cache = new Cache(`template:${template_name}`, () => {
		return store.templates.render(template_name, context, partials);
	});

	store.settings.on('load', () => cache.invalidate());
	store.settings.on('update', () => cache.invalidate());
	store.color_themes.on('load', () => cache.invalidate());
	store.color_themes.on('update', () => cache.invalidate());
	store.templates.on('load', () => cache.invalidate());
	store.templates.on('update', () => cache.invalidate());

	return cache;
}

export function simple_template_cache(template_name: TemplateName, no_render = false) {
	const cache = no_render
		? new Cache(`simple_template:${template_name}`, () => store.templates.templates[template_name])
		: new Cache(`simple_template:${template_name}`, () => {
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
