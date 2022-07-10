
import { STATUS_CODES } from 'http';

export class HttpError extends Error {
	constructor(
		public status_code: number,
		message: string,
		public log_message?: string,
		public additional?: object
	) {
		super(message);
	}

	/** @deprecated */
	public get statusCode() {
		return this.status_code;
	}

	public get status_message() {
		return STATUS_CODES[this.status_code];
	}
}

export function throw_401_not_authorized(message: string, log_message?: string, additional?: object) : never {
	throw new HttpError(401, message, log_message, additional);
}

export function throw_403_forbidden(message: string, log_message?: string, additional?: object) : never {
	throw new HttpError(403, message, log_message, additional);
}

export function throw_404_not_found(message: string, log_message?: string, additional?: object) : never {
	throw new HttpError(404, message, log_message, additional);
}

export function throw_415_unsupported_media_type(message: string, log_message?: string, additional?: object) : never {
	throw new HttpError(415, message, log_message, additional);
}

export function throw_422_unprocessable_entity(message: string, log_message?: string, additional?: object) : never {
	throw new HttpError(422, message, log_message, additional);
}

export function throw_429_too_many_requests(message: string, log_message?: string, additional?: object) : never {
	throw new HttpError(429, message, log_message, additional);
}

export function throw_500_internal_server_error(message: string, log_message?: string, additional?: object) : never {
	throw new HttpError(500, message, log_message, additional);
}
