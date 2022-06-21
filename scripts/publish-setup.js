
const { resolve } = require('path');
const { writeFileSync } = require('fs');
const { version } = require('../package.json');

const tags_file = resolve(__dirname, '../.tags');

const [ base_version, pre_release ] = version.split('-');
const [ major, minor, patch ] = base_version.split('.');

const tags
	= pre_release ? [
		`${major}-${pre_release}`,
		`${major}-${pre_release}.${DRONE_BUILD_NUMBER}`,
		`${major}.${minor}-${pre_release}`,
		`${major}.${minor}-${pre_release}.${DRONE_BUILD_NUMBER}`,
		`${major}.${minor}.${patch}-${pre_release}`,
		`${major}.${minor}.${patch}-${pre_release}.${DRONE_BUILD_NUMBER}`,
	]
	: [
		`${major}`,
		`${major}.${minor}`,
		`${major}.${minor}.${patch}`,
	];

writeFileSync(tags_file, 'utf8', tags.join(','));
