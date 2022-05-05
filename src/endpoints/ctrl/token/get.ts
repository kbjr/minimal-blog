
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { create_jwt } from '../../../auth';
import * as http_error from '../../../http-error';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			200: {
				type: 'object',
				properties: {
					token: { type: 'string' },
					payload: {
						type: 'object',
						properties: {
							iss: { type: 'string' },
							sub: { type: 'string' },
							aud: { oneOf: [
								{ type: 'string' },
								{ type: 'array', items: { type: 'string' } },
							] },
							exp: { type: 'number' },
							iat: { type: 'number' },
							roles: {
								type: 'object',
								properties: {
									admin: { type: 'boolean' }
								}
							}
						}
					}
				}
			}
		},
		body: {
			type: 'object',
			properties: {
				username: { type: 'string' },
				password: { type: 'string' }
			},
			required: ['username', 'password']
		}
	}
};

type Req = FastifyRequest<{
	Body: {
		username: string;
		password: string;
	};
}>;

ctrl.post('/api/token', opts, async (req: Req, res) => {
	if (! req.body.username || typeof req.body.username !== 'string') {
		http_error.throw_422_unprocessable_entity('"username" field must be a string');
	}

	if (! req.body.password || typeof req.body.password !== 'string') {
		http_error.throw_422_unprocessable_entity('"password" field must be a string');
	}

	await store.users.verify_credentials(req.body.username, req.body.password);

	const user = store.users.get_user(req.body.username);
	const payload = {
		sub: req.body.username,
		roles: {
			admin: Boolean(user.is_admin)
		}
	};

	const token = create_jwt(payload);
	return { token, payload };
});
