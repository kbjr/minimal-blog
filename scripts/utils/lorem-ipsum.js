
const { http_post } = require('./http');

exports.lorem_ipsum = async function(amount, what) {
	const req_body = `amount=${amount}&what=${what}`;
	const req_header = {
		'user-agent': 'not a browser',
		'content-type': 'application/x-www-form-urlencoded',
		'content-length': req_body.length,
		'accept': 'application/json'
	};
	const { body } = await http_post('https://www.lipsum.com/feed/json', req_header, req_body);
	const data = JSON.parse(body);
	return data.feed.lipsum;
};
