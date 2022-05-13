
import { build_v1 } from './v1';
// import { migrate_v1_to_v2 } from './v1-to-v2';

interface Migration {
	(): Promise<void>;
}

/**
 * Ensures that the database files exist and are updated to their latest schema versions
 */
export async function bring_db_schema_up_to_date(no_update = false) {
	// TODO: Check if the DB exists at all
	// TODO: - If not, run all migrations
	// TODO: - Otherwise, get current DB version from `settings`
	// TODO:   - If a newer version exists then current, run all migrations after the current version
}

const migrations: Migration[] = [
	build_v1,
	// migrate_v1_to_v2,
];
