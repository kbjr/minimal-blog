
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { conf } from '../conf';
import { debug_logger } from '../debug';

const log = debug_logger('auth', `[auth:jwt]: `);

const secret = conf.auth.signing_key_file
	? readFileSync(conf.auth.signing_key_file)
	: randomBytes(conf.auth.hmac_secret_size);

export interface Roles {
	admin?: boolean;
}

export interface TokenPayload extends JwtPayload {
	roles: Roles;
}

export interface JwtData {
	sub: string;
	roles: Roles;
}

export function create_jwt(data: JwtData) {
	log(`Signing jwt for sub=${data.sub}, iss=${conf.http.ctrl_url}`);

	return sign(data, secret, {
		mutatePayload: true,
		expiresIn: conf.auth.token_ttl,
		issuer: conf.http.ctrl_url,
		audience: [
			conf.http.ctrl_url,
			conf.http.web_url,
		],
	});
}

export function verify_jwt(token: string) {
	log(`Attempting to verify jwt as aud=${conf.http.ctrl_url}`);

	return verify(token, secret, {
		issuer: conf.http.ctrl_url,
		audience: conf.http.ctrl_url
	});
}
