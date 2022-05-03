
import { hash, verify, argon2id } from 'argon2';

export function hash_password(password: string) {
	return hash(password, {
		type: argon2id,
		hashLength: 100,
		timeCost: 3,
		memoryCost: 4096
	});
}

export function verify_password(password: string, hash: string) {
	return verify(hash, password, {
		// 
	});
}
