
import { FastifyRequest } from 'fastify';
import * as http_error from '../http-error';
import { TokenPayload, verify_jwt } from './jwt-key';

export { create_jwt, verify_jwt } from './jwt-key';
export { hash_password, verify_password } from './password-hash';

export type ReqUser = {
	user: TokenPayload;
};

export function require_auth(req: FastifyRequest & ReqUser, require_admin = false) {
	const header = req.headers['authorization'];
	
	if (! header) {
		http_error.throw_401_not_authorized('Auth token required');
	}

	if (! header.startsWith('Bearer ')) {
		http_error.throw_401_not_authorized('Invalid authorization header');
	}

	const token = header.slice(7);
	
	try {
		// TODO: Make this async?
		req.user = verify_jwt(token) as TokenPayload;

		if (require_admin && ! req.user.roles.admin) {
			http_error.throw_403_forbidden('Not authorized', `Attempted admin-only action as non-admin user "${req.user.sub}"`);
		}
	}

	catch (error) {
		console.error(error);
		http_error.throw_401_not_authorized('Token failed verification');
	}
}
