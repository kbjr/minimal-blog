
import { conf } from '../conf';
import { Storage } from './storage';
import { Storage_sqlite3 } from './sqlite3';

export let store: Storage;
export type { Storage } from './storage';

switch (conf.data.storage_type) {
	case conf.data.StorageType.sqlite3:
		store = new Storage_sqlite3();
		break;

	default:
		throw new Error(`Invalid storage type "${conf.data.storage_type}" found in config`);
}
