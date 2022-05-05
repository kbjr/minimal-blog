
import { conf } from '../conf';
import { promises as fs } from 'fs';
import { resolve as resolve_path } from 'path';
import { log_debug } from '../debug';

export function load_control_panel_template(template_name: string) {
	log_debug('ctrl_templates', `[ctrl_templates]: Loading template ${template_name} from disk`);
	const path = resolve_path(conf.data.assets_path, 'control-panel', template_name);
	return fs.readFile(path, 'utf8');
}
