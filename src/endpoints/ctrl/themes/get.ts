
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

type Req = ReqUser & FastifyRequest<{ }>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['themes'],
		description: 'Returns a list of all existing Color Themes',
		response: {
			200: {
				type: 'object',
				additionalProperties: {
					type: 'object',
					// TODO: Refactor this to a central place
					properties: {
						$builtin: { type: 'boolean' },
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
						bg_button_primary_hover: { type: 'string' },
						text_button_primary: { type: 'string' },
						bg_button_secondary: { type: 'string' },
						bg_button_secondary_hover: { type: 'string' },
						text_button_secondary: { type: 'string' },
						bg_input: { type: 'string' },
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
			}
		}
	}
};

ctrl.get('/api/themes', opts, async (req: Req, res) => {
	require_auth(req);
	return store.colors.get_all();
});
