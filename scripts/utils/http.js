
const { URL } = require('url');
const { request: https_request } = require('https');
const { request: http_request } = require('http');

let next_id = 1;
const timeout = 5000;

exports.http_get = function http_get(url_str, headers) {
	return exports.http_req('GET', url_str, headers, null);
};

exports.http_head = function http_head(url_str, headers) {
	return exports.http_req('HEAD', url_str, headers, null);
};

exports.http_post = function http_post(url_str, headers, body) {
	return exports.http_req('POST', url_str, headers, body);
};

exports.http_put = function http_put(url_str, headers, body) {
	return exports.http_req('PUT', url_str, headers, body);
};

exports.http_patch = function http_patch(url_str, headers, body) {
	return exports.http_req('PATCH', url_str, headers, body);
};

exports.http_delete = function http_delete(url_str, headers, body) {
	return exports.http_req('DELETE', url_str, headers, body);
};

exports.http_req = async function http_req(method, url_str, headers, body) {
	const url = new URL(url_str);
	const make_request
		= url.protocol === 'https:' ? https_request
		: url.protocol === 'http:' ? http_request
		: null;

	if (! make_request) {
		throw new Error('illegal protocol');
	}

	if (url.username || url.password) {
		throw new Error('urls containing user credentials not allowed');
	}

	const result = {
		url,
		req: null,
		res: null,
		status: null,
		body: null,
		headers: null,
	};

	const port = url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80);
	const info = {
		req_id: next_id++,
		method: method,
		protocol: url.protocol,
		hostname: url.hostname,
		port: port,
		path: url.pathname,
	};

	console.info('starting outbound http request', info);

	return new Promise((resolve, reject) => {
		const req = make_request({
			method: method,
			protocol: url.protocol,
			hostname: url.hostname,
			port: port,
			path: url.pathname,
			headers: headers || { }
		}, (res) => {
			result.res = res;
			result.status = res.statusCode;

			console.info(`response status ${res.statusCode}`, info);

			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				result.body = data;
				result.headers = res.headers;
				resolve(result);
			});
		});

		result.req = req;
	
		req.setTimeout(timeout, () => {
			console.error('request timeout', info);
			req.destroy();
		});
	
		req.on('error', (error) => {
			console.error('request error ' + error.stack, info);
			reject(error);
		});

		if (body) {
			req.write(body);
		}

		req.end();
	});
};
