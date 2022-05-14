
import { conf } from '../conf';
import { dict } from '../util';
import { promises as fs } from 'fs';
import { resolve as resolve_path } from 'path';
import { log_debug } from '../debug';

let cache = dict<string, string>();
let katex_cache = dict<string, string>();

export function clear_cache() {
	cache = dict();
	katex_cache = dict();
}

export async function load_asset(file_name: string, skip_cache = false) {
	if (cache[file_name] && ! skip_cache) {
		return cache[file_name];
	}

	log_debug('asset_files', `[asset_files]: Loading asset file ${file_name} from disk`);
	const path = resolve_path(conf.assets.path, file_name);
	const contents = await fs.readFile(path, 'utf8');

	return cache[file_name] = contents;
}

export function load_default_template(template_name: string, skip_cache = false) {
	return load_asset('templates/' + template_name, skip_cache);
}

export function load_control_panel_asset(file_name: string, skip_cache = false) {
	return load_asset('control-panel/' + file_name, skip_cache);
}

// FIXME: There has to be a better way to serve these files than this bullshit...
export async function load_katex_asset(file_name: string, skip_cache = false) {
	if (katex_cache[file_name] && ! skip_cache) {
		return katex_cache[file_name];
	}

	log_debug('asset_files', `[asset_files]: Loading KaTeX asset file ${file_name} from disk`);
	const path = resolve_path(conf.assets.katex_path, file_name);
	const contents = await fs.readFile(path, 'utf8');

	return katex_cache[file_name] = contents;
}
