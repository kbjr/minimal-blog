
import * as mustache from 'mustache';
import { load_control_panel_template } from '../../../storage/control-panel-templates';

let templates: Record<string, string> = { };

export function clear_templates() {
	templates = { };
}

export async function render(name: string, context: Readonly<object>, partials?: Readonly<Record<string, string>>) {
	if (! templates[name]) {
		templates[name] = await load_control_panel_template(name);
	}

	return mustache.render(templates[name], context, partials);
}

export async function get_unrendered(name: string) {
	if (! templates[name]) {
		templates[name] = await load_control_panel_template(name);
	}

	return templates[name];
}
