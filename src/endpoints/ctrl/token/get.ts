
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { create_jwt } from '../../../auth';
import * as http_error from '../../../http-error';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { arr, int, JSONSchema6, obj, one_of, str } from '../../../json-schema';

const res_schema: JSONSchema6 = obj({
	token: str(),
	payload: obj({
		iss: str(),
		sub: str(),
		aud: one_of([
			str(),
			arr(str()),
		]),
		exp: int(),
		iat: int()
	})
});

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['auth'],
		description: 'The primary "login" endpoint; Exchanges login credentials for a JWT access token',
		response: {
			200: res_schema
		},
		body: {
			type: 'object',
			properties: {
				password: str()
			},
			required: ['password']
		}
	}
};

type Req = FastifyRequest<{
	Body: {
		password: string;
	};
}>;

ctrl.post('/api/token', opts, async (req: Req, res) => {
	if (! req.body.password || typeof req.body.password !== 'string') {
		http_error.throw_422_unprocessable_entity('"password" field must be a string');
	}

	await store.settings.check_password(req.body.password);
	const payload = { sub: 'admin' };

	const token = create_jwt(payload);
	return { token, payload };
});
