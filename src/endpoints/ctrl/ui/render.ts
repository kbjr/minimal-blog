
import { current_lang } from './i18n';
import { conf } from '../../../conf';
import { dict } from '../../../util';
import { load_control_panel_asset } from '../../../storage/assets';
import * as mustache from 'mustache';
import { store } from '../../../storage';
import { TemplateContext } from '../../../storage/templates';

let templates = dict<string, string>();

function clear_templates() {
	templates = dict();
}

store.events.on('settings.load', clear_templates);
store.events.on('settings.update', clear_templates);

export async function render(name: string, context: Readonly<object>, partials?: Readonly<Record<string, string>>) {
	if (! templates[name]) {
		templates[name] = await load_control_panel_asset(name);
	}

	context = Object.assign(new TemplateContext(null, null, null), context, {
		labels: current_lang,
		ctrl_panel: {
			url: conf.http.ctrl_url,
			lang: current_lang.lang_code,
		}
	});

	return mustache.render(templates[name], context, partials);
}
