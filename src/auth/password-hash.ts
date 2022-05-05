
import { conf } from '../conf';
import { log_debug } from '../debug';
import { hash, verify, argon2id } from 'argon2';

const { hash_length, time_cost, memory_cost } = conf.auth.argon2

log_debug('auth', `[auth:argon2] Configured with hash_length=${hash_length}, time_cost=${time_cost}, memory_cost=${memory_cost}`);

export function hash_password(password: string) {
	return hash(password, {
		type: argon2id,
		hashLength: hash_length,
		timeCost: time_cost,
		memoryCost: memory_cost
	});
}

export function verify_password(password: string, hash: string) {
	return verify(hash, password, {
		// 
	});
}
