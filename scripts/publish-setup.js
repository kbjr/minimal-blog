
const { resolve } = require('path');
const { version } = require('../package.json');
const { writeFileSync } = require('fs');

const tags_file = resolve(__dirname, '../.tags');

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
