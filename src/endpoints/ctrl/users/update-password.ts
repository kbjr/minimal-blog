
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';

type Req = ReqUser & FastifyRequest<{
	Body: {
		username: string;
		password: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			204: { }
		}
	}
};

ctrl.put('/api/users/:name/password', opts, async (req: Req, res) => {
	require_auth(req);

	if (req.body.username !== req.user.sub && ! req.user.roles.admin) {
		http_error.throw_403_forbidden('Not authorized', `User "${req.user.sub}" attempted to modify the password of "${req.body.username}"`);
	}

	await store.users.update_password(req.body.username, req.body.password);
	res.status(204);
});
