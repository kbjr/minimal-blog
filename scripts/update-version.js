
const { resolve } = require('path');
const { version } = require('../package.json');
const { writeFileSync, readFileSync } = require('fs');

const conf_file = resolve(__dirname, '../src/conf.ts');

const version_expression = `require('../package.json').version as string`;
const original_conf = readFileSync(conf_file, 'utf8');
const updated_conf = original_conf.replace(version_expression, `'${version}'`);

writeFileSync(conf_file, updated_conf, 'utf8');

console.log(`Updated "src/conf.ts" file with current full version number: ${version}`);
