
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';

type Req = ReqUser & FastifyRequest<{
	Body: {
		base_name?: string;
		theme_name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['themes'],
		description: 'Creates a new Color Theme, optionally starting with another Theme as a base',
		security: [
			{ bearer: [ ] }
		],
		response: {
			201: {
				type: 'object',
				properties: {
					sun: { type: 'string' },
					moon: { type: 'string' },
					bg_main: { type: 'string' },
					bg_light: { type: 'string' },
					bg_heavy: { type: 'string' },
					bg_accent: { type: 'string' },
					line: { type: 'string' },
					text_heading: { type: 'string' },
					text_body: { type: 'string' },
					text_light: { type: 'string' },
					text_link: { type: 'string' },
					text_link_active: { type: 'string' },
					text_link_visited: { type: 'string' },
					text_highlight: { type: 'string' },
					bg_text_highlight: { type: 'string' },
					text_selection: { type: 'string' },
					bg_text_selection: { type: 'string' },
					bg_button_primary: { type: 'string' },
					text_button_primary: { type: 'string' },
					bg_button_secondary: { type: 'string' },
					text_button_secondary: { type: 'string' },
					border_input: { type: 'string' },
					border_input_invalid: { type: 'string' },
					code_normal: { type: 'string' },
					code_shadow: { type: 'string' },
					code_background: { type: 'string' },
					code_selection: { type: 'string' },
					code_comment: { type: 'string' },
					code_punc: { type: 'string' },
					code_operator: { type: 'string' },
					code_const_literal: { type: 'string' },
					code_number_literal: { type: 'string' },
					code_boolean_literal: { type: 'string' },
					code_tag: { type: 'string' },
					code_string: { type: 'string' },
					code_keyword: { type: 'string' },
					code_func_name: { type: 'string' },
					code_class_name: { type: 'string' },
					code_regex_important: { type: 'string' },
					code_variable: { type: 'string' },
					code_builtin: { type: 'string' },
					code_attr_name: { type: 'string' },
					code_gutter_divider: { type: 'string' },
					code_line_number: { type: 'string' },
					code_line_highlight: { type: 'string' },
				}
			}
		},
		body: {
			type: 'object',
			properties: {
				base_name: { type: 'string' },
				theme_name: { type: 'string' },
			},
			required: ['theme_name']
		}
	}
};

ctrl.post('/api/themes', opts, async (req: Req, res) => {
	require_auth(req, true);

	const { base_name, theme_name } = req.body;

	if (store.colors.exists(theme_name)) {
		http_error.throw_422_unprocessable_entity('Given theme name already exists');
	}

	if (base_name && ! store.colors.exists(base_name)) {
		http_error.throw_422_unprocessable_entity('Given base theme name does not exist');
	}

	await store.colors.create_theme(theme_name, base_name);
	const theme = store.colors.get(theme_name);

	res.status(201);
	return theme;
});
