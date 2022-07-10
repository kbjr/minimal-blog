
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { obj, str, str_enum } from '../../../json-schema';
import { attempt_login_lock } from '../../../auth/login-lock';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['auth', 'settings'],
		description: 'Updates the login password',
		response: {
			200: obj({
				message: str_enum([ 'ok' ])
			})
		},
		body: {
			type: 'object',
			properties: {
				current_password: str(),
				new_password: str(),
			},
			required: ['current_password', 'new_password']
		}
	}
};

type Req = FastifyRequest<{
	Body: {
		current_password: string;
		new_password: string;
	};
}>;

ctrl.put('/api/settings/password', opts, async (req: Req, res) => {
	attempt_login_lock();
	await store.settings.update_password(req.body.new_password, req.body.current_password);
	return { message: 'ok' };
});
