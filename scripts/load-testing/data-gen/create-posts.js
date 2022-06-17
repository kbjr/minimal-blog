
const { APIClient } = require('../../utils/api');
const { lorem_ipsum } = require('../../utils/lorem-ipsum');

const api = new APIClient('http://localhost:3001');

const sample_count = 30;
const content_samples = [ ];

main();

async function main() {
	await api.login('', '');
	await populate_content_samples();

	for (let i = 0; i < 10000; i++) {
		await create_note(content_samples[i % sample_count]);
	}
}

async function populate_content_samples() {
	for (let i = 0; i < sample_count; i++) {
		const words = 15 + (Math.random() * 200) | 0;

		content_samples.push(
			await lorem_ipsum(words, 'words', false)
		);
	}
}

async function create_note(content) {
	const uri_name = await api.get_snowflake();
	await api.create_note(uri_name, content, [ 'test3', 'lipsum' ], false);
}
