
import { conf } from '../../conf';
import { promises as fs } from 'fs';
import { resolve as resolve_path } from 'path';
import { TemplateName } from '../templates';

export function load_default_template(template_name: TemplateName) {
	const path = resolve_path(conf.data.assets_path, template_name);
	return fs.readFile(path, 'utf8');
}
