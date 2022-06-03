
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { conf } from '../conf';
import { logger } from '../debug';

const log = logger('auth').child({ system: 'jwt' });

const secret
	= conf.auth.signing_key_file ? readFileSync(conf.auth.signing_key_file)
	: conf.auth.hmac_secret ? Buffer.from(conf.auth.hmac_secret, 'base64')
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
	log.info(`Signing jwt for sub=${data.sub}, iss=${conf.http.ctrl_url}`);

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
	log.info(`Attempting to verify jwt as aud=${conf.http.ctrl_url}`);

	return verify(token, secret, {
		issuer: conf.http.ctrl_url,
		audience: conf.http.ctrl_url
	});
}
