
import { en_us } from './en_us';
import { store } from '../../../../storage';

export let current_lang = en_us;

store.events.on('settings.load', update_lang);
store.events.on('settings.update', update_lang);

function update_lang() {
	const lang = store.settings.get('ctrl_panel_language');
	current_lang = lang_by_code(lang) || en_us;
}

export const languages = {
	en_us
};

export function lang_by_code(lang_code: LangCode) {
	const key = lang_code.toLowerCase().replace('-', '_')
	return languages[key];
}

export type LangCode
	= 'en-us'
	;
