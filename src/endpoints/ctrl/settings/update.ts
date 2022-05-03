
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

type Req = ReqUser & FastifyRequest<{
	Body: {
		// ...
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			204: { }
		}
	}
};

ctrl.patch('/api/settings', opts, async (req: Req, res) => {
	require_auth(req);
	// TODO: Update settings
	console.log(req.body);
	res.status(204);
});
