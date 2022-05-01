
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { RouteShorthandOptions } from 'fastify';

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			200: {
				type: 'object',
				additionalProperties: {
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

ctrl.get('/themes', opts, async (req, res) => {
	return store.color_themes.get_all();
});
