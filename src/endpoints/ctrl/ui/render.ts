
import * as mustache from 'mustache';
import { conf } from '../../../conf';
import { load_control_panel_template } from '../../../storage/control-panel-templates';
import { languages } from './i18n';

let templates: Record<string, string> = { };

export function clear_templates() {
	templates = { };
}

export async function render(name: string, context: Readonly<object>, partials?: Readonly<Record<string, string>>) {
	if (! templates[name]) {
		templates[name] = await load_control_panel_template(name);
	}

	context = Object.assign({
		site: {
			url: conf.http.web_url
			// 
		},
		ctrl_panel: {
			url: conf.http.ctrl_url
		},
		labels: languages.en_us
	}, context);

	return mustache.render(templates[name], context, partials);
}

export async function get_unrendered(name: string) {
	if (! templates[name]) {
		templates[name] = await load_control_panel_template(name);
	}

	return templates[name];
}
