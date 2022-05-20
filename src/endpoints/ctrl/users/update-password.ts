
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';

type Req = ReqUser & FastifyRequest<{
	Params: {
		username: string;
	};
	Body: {
		password: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['users', 'auth'],
		description: 'Updates a users password',
		security: [
			{ bearer: [ ] }
		],
		body: {
			type: 'object',
			properties: {
				password: { type: 'string' }
			}
		},
		params: {
			type: 'object',
			properties: {
				username: { type: 'string' }
			}
		},
		response: {
			204: { }
		}
	}
};

ctrl.put('/api/users/:username/password', opts, async (req: Req, res) => {
	require_auth(req);

	if (req.params.username !== req.user.sub && ! req.user.roles.admin) {
		http_error.throw_403_forbidden('Not authorized', `User "${req.user.sub}" attempted to modify the password of "${req.params.username}"`);
	}

	await store.users.update_password(req.params.username, req.body.password);
	res.status(204);
});
