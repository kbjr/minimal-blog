
const { resolve } = require('path');
const { writeFileSync } = require('fs');
const { version } = require('../package.json');

const tags_file = resolve(__dirname, '../.tags');

const [ base_version, pre_release ] = version.split('-');
const [ major, minor, patch ] = base_version.split('.');
const build = process.env.DRONE_BUILD_NUMBER;

const tags
	= pre_release ? [
		`${major}-${pre_release}`,
		`${major}-${pre_release}.${build}`,
		`${major}.${minor}-${pre_release}`,
		`${major}.${minor}-${pre_release}.${build}`,
		`${major}.${minor}.${patch}-${pre_release}`,
		`${major}.${minor}.${patch}-${pre_release}.${build}`,
	]
	: [
		`${major}`,
		`${major}.${minor}`,
		`${major}.${minor}.${patch}`,
	];

writeFileSync(tags_file, tags.join(','), 'utf8');

console.log(`Setup to publish container image with the following tags:\n- ${tags.join('\n- ')}`);
