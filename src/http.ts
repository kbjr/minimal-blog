
import { conf } from './conf';
import { HttpError } from './http-error';
import { xml_content_processor, xml_rpc_fault } from './xml-rpc';
import fastify, { FastifyError, FastifyLoggerOptions, FastifyReply, FastifyRequest } from 'fastify';
import formbody from '@fastify/formbody';
import { swagger_opts } from './swagger';
import { show_not_found } from './endpoints/web/not-found';
import { store } from './storage';

const logging: FastifyLoggerOptions = conf.logging.level !== 'none' && {
	level: conf.logging.level,
	prettyPrint: conf.logging.pretty && {
		translateTime: 'HH:MM:ss Z',
		ignore: 'pid,hostname'
	}
};

export const web = fastify({
	logger: logging
});

export const ctrl = fastify({
	logger: logging
});

export async function setup_plugins() {
	if (conf.http.cache.enable_etags) {
		const etags = require('@fastify/etag');
		await web.register(etags);
		await ctrl.register(etags);
	}

	if (conf.http.compress.enable) {
		const compress = require('@fastify/compress');
		await web.register(compress, { encodings: conf.http.compress.encodings });
		await ctrl.register(compress, { encodings: conf.http.compress.encodings });
	}

	if (conf.http.ctrl_enable_swagger) {
		const swagger = require('@fastify/swagger');
		await ctrl.register(swagger, swagger_opts);
	}

	await web.register(formbody);
}



// ===== Request Body Parsers =====

// PNG for favicon uploads
ctrl.addContentTypeParser([ 'image/png', 'image/jpeg', 'image/gif' ], { parseAs: 'buffer' }, noop_content_processor);

// Various text formats for templates and markdown previews
ctrl.addContentTypeParser([ 'text/html', 'text/markdown', 'text/css' ], { parseAs: 'string' }, noop_content_processor);

// XML for pingbacks
web.addContentTypeParser([ 'text/xml', 'application/xml', 'application/rss+xml' ], { parseAs: 'string' }, xml_content_processor);

function noop_content_processor(req: FastifyRequest, payload: string | Buffer, done: (err: Error | null, body?: any) => void) {
	done(null, payload);
}



// ===== Error Handlers =====

web.setErrorHandler(error_handler(true));
ctrl.setErrorHandler(error_handler(false));

web.setNotFoundHandler((req, res) => {
	show_not_found(req, res);
});

type ValidationError = Error & {
	validation: object[];
	validationContext: string;
};

function error_handler(is_web: boolean) {
	type Err = Error | FastifyError | ValidationError;

	function send_pingback_error(error: Err, req: FastifyRequest, res: FastifyReply) {
		res.status(200);
		res.type('text/xml; charset=utf-8');
		res.send(xml_rpc_fault(-32700, error.message));
	}

	function send_webmention_error(error: HttpError, req: FastifyRequest, res: FastifyReply) {
		res.status(error.status_code);
		res.send({
			error: error.message
		});
	}

	function send_http_error_web(error: HttpError, req: FastifyRequest, res: FastifyReply) {
		if (error.status_code === 404) {
			show_not_found(req, res);
			return;
		}
		
		// TODO: show generic error page
		res.status(500);
		res.send();
	}

	function send_http_error_ctrl(error: HttpError, req: FastifyRequest, res: FastifyReply) {
		const body = { error: error.message };

		if (error.additional) {
			Object.assign(body, error.additional);
		}

		res.status(error.status_code);
		res.send(body);

		if (error.log_message) {
			ctrl.log.error(error.log_message);
		}
	}

	function send_validation_error(error: ValidationError, req: FastifyRequest, res: FastifyReply) {
		res.status(422);
		res.send({
			error: error.message,
			validation: error.validation
		});
	}

	function send_fastify_error_web(error: FastifyError, req: FastifyRequest, res: FastifyReply) {
		if (error.statusCode === 404) {
			show_not_found(req, res);
			return;
		}
		
		// TODO: show generic error page
		res.status(500);
		res.send();
	}

	function send_fastify_error_ctrl(error: FastifyError, req: FastifyRequest, res: FastifyReply) {
		res.status(error.statusCode);
		res.send({
			error: error.message,
			validation: error.validation
		});
	}

	return function(error: Err, req: FastifyRequest, res: FastifyReply) {
		// If hitting the XML-RPC pingback endpoint, respond with an XML-RPC formatted error
		if (req.url === '/pingback' && store.settings.get('receive_pingback')) {
			send_pingback_error(error, req, res);
		}

		else if (error instanceof HttpError) {
			if (is_web) {
				if (req.url === '/webmention' && store.settings.get('receive_webmention')) {
					send_webmention_error(error, req, res);
				}

				else {
					send_http_error_web(error, req, res);
				}
			}

			else {
				send_http_error_ctrl(error, req, res);
			}
		}

		else if ('validationContext' in error) {
			send_validation_error(error, req, res);
		}

		else if ('statusCode' in error) {
			if (is_web) {
				send_fastify_error_web(error, req, res);
			}

			else {
				send_fastify_error_ctrl(error, req, res);
			}
		}

		else {
			ctrl.log.error(error);
	
			res.status(500);
	
			if (is_web) {
				// TODO: Better error for web
				res.type('application/json; charset=utf-8');
				res.send({ error: 'unknown error' });
			}
	
			else {
				res.type('application/json; charset=utf-8');
				res.send({ error: 'unknown error' });
			}
		}
	};
}



// ===== Listen =====

export async function listen() {
	if (conf.http.ctrl_enable_swagger) {
		await ctrl.ready();
		ctrl.swagger();
	}

	web.listen(conf.http.web_port, '0.0.0.0', (error, addr) => {
		if (error) {
			web.log.error(error);
			process.exit(1);
		}
	});

	ctrl.listen(conf.http.ctrl_port, '0.0.0.0', (error, addr) => {
		if (error) {
			ctrl.log.error(error);
			process.exit(1);
		}
	});
}
