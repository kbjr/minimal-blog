
import { languages } from './i18n';
import { conf } from '../../../conf';
import { dict } from '../../../util';
import { load_control_panel_asset } from '../../../storage/assets';
import * as mustache from 'mustache';

let templates = dict<string, string>();

export function clear_templates() {
	templates = dict();
}

export async function render(name: string, context: Readonly<object>, partials?: Readonly<Record<string, string>>) {
	if (! templates[name]) {
		templates[name] = await load_control_panel_asset(name);
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
