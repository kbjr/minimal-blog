
import { ctrl } from '../../../http';
import { bool, obj } from '../../../json-schema';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['auth'],
		description: 'Verifies that the provided token is valid, not expired, and was issued by this server',
		security: [
			{ bearer: [ ] }
		],
		response: {
			200: obj({
				valid: bool()
			})
		}
	}
};

type Req = ReqUser & FastifyRequest<{ }>;

ctrl.get('/api/token/validate', opts, async (req: Req, res) => {
	require_auth(req);
	return { valid: true };
});
