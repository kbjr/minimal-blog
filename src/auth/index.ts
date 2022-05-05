
import { FastifyRequest } from 'fastify';
import { debug_logger } from '../debug';
import * as http_error from '../http-error';
import { TokenPayload, verify_jwt } from './jwt-key';

export { create_jwt, verify_jwt } from './jwt-key';
export { hash_password, verify_password } from './password-hash';

const log = debug_logger('auth', `[auth:require]: `);

export type ReqUser = {
	user: TokenPayload;
};

export function require_auth(req: FastifyRequest & ReqUser, require_admin = false) {
	const header = req.headers['authorization'];
	
	if (! header) {
		log(`${req.id} -> Reject: no authorization header present`);
		http_error.throw_401_not_authorized('Auth token required');
	}

	if (! header.startsWith('Bearer ')) {
		log(`${req.id} -> Reject: authorization header does not begin with "Bearer: "`);
		http_error.throw_401_not_authorized('Invalid authorization header');
	}

	const token = header.slice(7);
	
	try {
		// TODO: Make this async?
		req.user = verify_jwt(token) as TokenPayload;

		// TODO: Make sure the user still exists in the DB (i.e. hasn't been deleted since the token was created)

		if (require_admin) {
			if (! req.user.roles.admin) {
				log(`${req.id} -> Reject: attempted admin-only action as non-admin user`);
				http_error.throw_403_forbidden('Not authorized', `Attempted admin-only action as non-admin user "${req.user.sub}"`);
			}

			log(`${req.id} -> Approve: jwt passed verification and can perform the requested admin action`);
		}

		else {
			log(`${req.id} -> Approve: jwt passed verification and admin permissions are not required`);
		}
	}

	catch (error) {
		if (error instanceof http_error.HttpError) {
			throw error;
		}
		
		log(`${req.id} -> Reject: jwt failed verification`);
		console.error(error);
		http_error.throw_401_not_authorized('Token failed verification');
	}
}
