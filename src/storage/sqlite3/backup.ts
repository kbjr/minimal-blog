
import { conf } from '../../conf';
import { logger } from '../../debug';
import { promises as fs, constants } from 'fs';

const log = logger('sqlite');

export async function create_backup() {
	const timestamp_suffix = (new Date).toISOString().replace(/[-:T]/g, '.').slice(0, -1);

	await Promise.all([
		backup_file(conf.data.sqlite3.settings_path),
		backup_file(conf.data.sqlite3.posts_path),
	]);

	async function backup_file(file: string) {
		log.debug(`generating backup ${file}.bak.${timestamp_suffix}`);
		const new_file = `${file}.bak.${timestamp_suffix}`;
		await fs.copyFile(file, new_file, constants.COPYFILE_EXCL);
	}
}
