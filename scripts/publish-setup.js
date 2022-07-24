
const { resolve } = require('path');
const { version } = require('../package.json');
const { writeFileSync, readFileSync } = require('fs');

const tags_file = resolve(__dirname, '../.tags');
const conf_file = resolve(__dirname, '../src/conf.ts');

const [ base_version, pre_release ] = version.split('-');
const [ major, minor, patch ] = base_version.split('.');

const tags
	= pre_release ? [
		`${major}-${pre_release}`,
		`${major}.${minor}-${pre_release}`,
		`${major}.${minor}.${patch}-${pre_release}`,
	]
	: [
		`${major}`,
		`${major}.${minor}`,
		`${major}.${minor}.${patch}`,
	];

writeFileSync(tags_file, tags.join(','), 'utf8');

console.log(`Wrote ".tags" file with the following container image tags:\n- ${tags.join('\n- ')}`);

const version_expression = `require('../package.json').version as string`;
const original_conf = readFileSync(conf_file, 'utf8');
const updated_conf = original_conf.replace(version_expression, `'${version}'`);

writeFileSync(conf_file, updated_conf, 'utf8');

console.log(`Updated "src/conf.ts" file with current full version number: ${version}`);
