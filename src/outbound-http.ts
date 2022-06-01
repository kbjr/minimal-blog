
import { URL } from 'url';
import { logger } from './debug';
import { store } from './storage';
import { request as http_request, ClientRequest, IncomingMessage, OutgoingHttpHeaders } from 'http';
import { request as https_request } from 'https';

const http_log = logger('outbound_http');

let next_id = 1;
export const timeout = 5000;

export interface HttpResult {
	url: URL;
	req: ClientRequest;
	res: IncomingMessage;
	status: number;
	body: string;
}

export function http_get(url_str: string, headers?: OutgoingHttpHeaders) {
	return http_req('GET', url_str, headers, null);
}

export function http_head(url_str: string, headers?: OutgoingHttpHeaders) {
	return http_req('HEAD', url_str, headers, null);
}

export function http_post(url_str: string, headers?: OutgoingHttpHeaders, body?: string) {
	return http_req('POST', url_str, headers, body);
}

export function http_put(url_str: string, headers?: OutgoingHttpHeaders, body?: string) {
	return http_req('PUT', url_str, headers, body);
}

export function http_patch(url_str: string, headers?: OutgoingHttpHeaders, body?: string) {
	return http_req('PATCH', url_str, headers, body);
}

export function http_delete(url_str: string, headers?: OutgoingHttpHeaders, body?: string) {
	return http_req('DELETE', url_str, headers, body);
}

export async function http_req(method: string, url_str: string, headers?: OutgoingHttpHeaders, body?: string) {
	const url = new URL(url_str);
	const make_request
		= url.protocol === 'https:' ? https_request
		: url.protocol === 'http:' ? http_request
		: null;

	if (! make_request) {
		throw new Error('illegal protocol');
	}

	if (url.protocol !== 'https:' && store.settings.get('https_only')) {
		throw new Error('non-secure http requests not allowed');
	}

	if (url.username || url.password) {
		throw new Error('urls containing user credentials not allowed');
	}

	const result: HttpResult = {
		url,
		req: null,
		res: null,
		status: null,
		body: null,
	};

	const port = url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80);
	const log = http_log.child({
		req_id: next_id++,
		method: method,
		protocol: url.protocol,
		hostname: url.hostname,
		port: port,
		path: url.pathname,
	});

	log.info('starting outbound http request');

	return new Promise<HttpResult>((resolve, reject) => {
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

			log.info(`response status ${res.statusCode}`);

			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				result.body = data;
				resolve(result);
			});
		});

		result.req = req;
	
		req.setTimeout(timeout, () => {
			log.error('request timeout');
			req.destroy();
		});
	
		req.on('error', (error) => {
			log.error('request error ' + error.stack);
			reject(error);
		});

		if (body) {
			req.write(body);
		}

		req.end();
	});
}
