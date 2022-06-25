
import { store } from '../../../storage';
import { str, JSONSchema6Definition, obj, bool, dict } from '../../../json-schema';

type Colors = Record<store.colors.ColorName, JSONSchema6Definition>;

const theme = <T = object>(additional?: T) => Object.assign(additional || { },
	store.colors.color_names.reduce<Colors>((memo, name) => {
		memo[name] = str();
		return memo;
	}, { } as Colors)
);

export const create_theme_req_body = obj({
	base_name: str(),
	theme_name: str(),
}, {
	required: [ 'theme_name' ]
});

export const create_theme_res_body = obj(theme(), {
	required: store.colors.color_names.slice()
});

export const get_theme_res_body = dict(
	obj(
		theme({
			$builtin: bool()
		})
	)
);
