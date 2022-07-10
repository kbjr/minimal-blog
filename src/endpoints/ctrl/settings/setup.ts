
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import * as http_error from '../../../http-error';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { obj, str, str_enum } from '../../../json-schema';
import { LangCode, lang_by_code } from '../ui/i18n';
import { attempt_login_lock } from '../../../auth/login-lock';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['meta'],
		description: 'First time setup endpoint.',
		response: {
			200: obj({
				message: str_enum([ 'ok' ])
			})
		},
		body: {
			type: 'object',
			properties: {
				password: str(),
				setup_code: str(),
				lang_code: str_enum([
					'en-us'
				]),
			},
			required: ['password', 'setup_code', 'lang_code']
		}
	}
};

type Req = FastifyRequest<{
	Body: {
		password: string;
		setup_code: string;
		lang_code: LangCode;
	};
}>;

ctrl.post('/api/setup', opts, async (req: Req, res) => {
	if (! lang_by_code(req.body.lang_code)) {
		http_error.throw_422_unprocessable_entity('invalid language code choice');
	}

	attempt_login_lock();

	await store.settings.setup_password(req.body.password, req.body.setup_code);
	await store.settings.set('ctrl_panel_language', req.body.lang_code);
	await store.settings.set('show_setup', false, true);

	return { message: 'ok' };
});
