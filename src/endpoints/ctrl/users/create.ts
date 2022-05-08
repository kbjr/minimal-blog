
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';

type Req = ReqUser & FastifyRequest<{
	Body: {
		username: string;
		password: string;
		is_admin?: boolean;
		first_time_setup?: boolean;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			201: {
				type: 'object',
				properties: {
					username: { type: 'string' },
					is_admin: { type: 'boolean' }
				}
			}
		},
		body: {
			type: 'object',
			properties: {
				username: { type: 'string' },
				password: { type: 'string' },
				is_admin: { type: 'boolean' },
				first_time_setup: { type: 'boolean' },
			},
			required: ['username', 'password']
		}
	}
};

ctrl.post('/api/users', opts, async (req: Req, res) => {
	let { username, password, is_admin, first_time_setup } = req.body;

	// NOTE: For first-time setup; If there are no users currently registered
	// in the system, a user can be created without authentication
	if (first_time_setup) {
		if (! store.users.no_users) {
			http_error.throw_401_not_authorized('"first_time_setup" not valid', 'Attempted first time setup despite users already existing');
		}

		is_admin = true;
	}

	else {
		require_auth(req, true);
	}

	await store.users.create_user(username, password, is_admin);

	// Once the first user is created, disable the first-time setup mode
	if (first_time_setup) {
		await store.settings.set_show_setup(0);
	}

	res.status(201);
	return { username, is_admin };
});
