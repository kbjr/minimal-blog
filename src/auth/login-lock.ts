
import { conf } from '../conf';
import * as http_error from '../http-error';

// Simple lock mechanism used to rate limit the login, setup and update password endpoints
// to prevent brute-forcing over the API

let locked = false;

export function attempt_login_lock() {
	if (locked) {
		http_error.throw_429_too_many_requests('Rate limited; Try again later');
	}

	locked = true;
	setTimeout(unlock, conf.auth.login_attempt_lock_duration);
}

function unlock() {
	locked = false;
}
