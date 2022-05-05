
import { ctrl } from '../../../http';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			200: {
				type: 'object',
				properties: {
					valid: { type: 'boolean' }
				}
			}
		}
	}
};

type Req = ReqUser & FastifyRequest<{
	Body: {
		username: string;
		password: string;
	};
}>;

ctrl.get('/api/token/validate', opts, async (req: Req, res) => {
	require_auth(req, false);
	return { valid: true };
});
