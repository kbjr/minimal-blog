
const { resolve } = require('path');
const { version } = require('../package.json');
const { writeFileSync } = require('fs');

const tags_file = resolve(__dirname, '../.tags');

const [ base_version, extra ] = version.split('-');
const [ major, minor, patch ] = base_version.split('.');
const [ pre_release, build_info ] = extra.split('#');
const [ pre_release_type ] = pre_release.split('.');

const tags
	= pre_release ? [
		`${major}-${pre_release_type}`,                      // e.g. "1-alpha"
		`${major}.${minor}-${pre_release_type}`,             // e.g. "1.2-alpha"
		`${major}.${minor}.${patch}-${pre_release_type}`,    // e.g. "1.2.3-alpha"
	]
	: [
		`${major}`,                                          // e.g. "1"
		`${major}.${minor}`,                                 // e.g. "1.2"
		`${major}.${minor}.${patch}`,                        // e.g. "1.2.3"
	];

if (pre_release && pre_release !== pre_release_type) {
	tags.push(`${major}.${minor}.${patch}-${pre_release}`);  // e.g. "1.2.3-alpha.4"
}

writeFileSync(tags_file, tags.join(','), 'utf8');

console.log(`Wrote ".tags" file with the following container image tags:\n- ${tags.join('\n- ')}`);
