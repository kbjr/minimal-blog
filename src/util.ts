
export function dict<K extends string | number | symbol, V>(data?: Record<K, V>) : Record<K, V> {
	const result = Object.create(null);

	if (data) {
		Object.assign(result, data);
	}

	return result;
}

export function obj<T>(data?: T) : T {
	const result = Object.create(null);

	if (data) {
		Object.assign(result, data);
	}

	return result;
}

export function obj_frozen<T>(data?: T) : Readonly<T> {
	const result = Object.create(null);

	if (data) {
		Object.assign(result, data);
	}

	return Object.freeze(result);
}

export function wrap_date(date: Date) {
	if (date) {
		return {
			get iso() {
				return date.toISOString();
			},
			get utc() {
				return date.toUTCString();
			},
		}
	}
}
