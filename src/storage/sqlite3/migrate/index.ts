
import * as sqlite3 from 'sqlite3';
import { conf } from '../../../conf';
import { build_v1 } from './v1';
import { open, close, list_tables, get_one } from '../db';
import { create_backup } from '../backup';
import { log_info } from '../../../debug';
// import { migrate_v1_to_v2 } from './v1-to-v2';

const supported_db_version = 1;

interface Migration {
	(): Promise<void>;
}

/**
 * Ensures that the database files exist and are updated to their latest schema versions
 */
export async function bring_db_schema_up_to_date(no_update = false) {
	log_info('sqlite', `[sqlite]: Checking for any needed DB updates...`);
	
	let db_version = await get_current_version();

	if (db_version === supported_db_version) {
		log_info('sqlite', `[sqlite]: DB already up to date`);
		return;
	}

	if (db_version > supported_db_version || db_version < 0) {
		console.error('settings.db seems to contain an unknown or unsupported version');
		process.exit(1);
	}

	if (no_update) {
		console.error('settings.db is out of date, but no_update flag is set');
		process.exit(1);
	}
	
	log_info('sqlite', `[sqlite]: DB needs updates`, { db_version, new_version: supported_db_version });

	if (db_version > 0) {
		// Create a backup of the existing DB before migrating
		log_info('sqlite', `[sqlite]: Creating backups before attempting updates...`);
		await create_backup();
	}

	while (db_version < supported_db_version) {
		log_info('sqlite', `[sqlite]: Performing update from v${db_version} to v${db_version + 1}...`);
		await migrations[db_version]();
		db_version++;
	}
}

async function get_current_version() : Promise<number> {
	const file = conf.data.sqlite3.settings_path;
	const mode = sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE;
	const table = 'settings';

	const db = await open(file, mode);

	try {
		const tables = await list_tables(db);
	
		if (! tables.length) {
			return 0;
		}
	
		if (! tables.find(({ name }) => name === table)) {
			throw new Error('settings.db invalid; no settings table found');
		}
	
		const { version } = await get_one(db, `
			select
				value as version
			from ${table}
			where name = 'version'
		`);

		if (typeof version !== 'number' || (version | 0) !== version) {
			throw new Error('settings.db invalid; version does not appear to be an integer');
		}

		return version;
	}
	
	finally {
		await close(db);
	}
}

const migrations: Migration[] = [
	build_v1,
	// migrate_v1_to_v2,
];
