
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

type Req = ReqUser & FastifyRequest<{
	Params: {
		name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['users'],
		description: 'Deletes a user account',
		security: [
			{ bearer: [ ] }
		],
		response: {
			204: { }
		}
	}
};

ctrl.delete('/api/users/:name', opts, async (req: Req, res) => {
	require_auth(req, true);
	await store.users.delete_user(req.params.name);
	res.status(204);
});
