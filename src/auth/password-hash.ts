
import { conf } from '../conf';
import { logger } from '../debug';
import { hash, verify, argon2id } from 'argon2';

const log = logger('auth').child({ system: 'argon2' });

const { hash_length, time_cost, memory_cost } = conf.auth.argon2;

log.info(`configured with hash_length=${hash_length}, time_cost=${time_cost}, memory_cost=${memory_cost}`);

export function hash_password(password: string) {
	log.trace('hashing password');

	return hash(password, {
		type: argon2id,
		hashLength: hash_length,
		timeCost: time_cost,
		memoryCost: memory_cost
	});
}

export function verify_password(password: string, hash: string) {
	log.trace('verifying password');

	return verify(hash, password, {
		// 
	});
}
