
import { STATUS_CODES } from 'http';

export class HttpError extends Error {
	constructor(
		public status_code: number,
		message: string,
		public additional?: string
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

export function throw_401_not_authorized(message: string, additional?: string) : never {
	throw new HttpError(401, message, additional);
}

export function throw_403_forbidden(message: string, additional?: string) : never {
	throw new HttpError(403, message, additional);
}

export function throw_404_not_found(message: string, additional?: string) : never {
	throw new HttpError(404, message, additional);
}

export function throw_422_unprocessable_entity(message: string, additional?: string) : never {
	throw new HttpError(422, message, additional);
}

export function throw_500_internal_server_error(message: string, additional?: string) : never {
	throw new HttpError(500, message, additional);
}
