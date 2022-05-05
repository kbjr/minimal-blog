
import { conf } from './conf';
import { HttpError } from './http-error';
import fastify, { FastifyError, FastifyLoggerOptions, FastifyReply, FastifyRequest } from 'fastify';

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

if (conf.http.cache.enable_etags) {
	const etags = require('@fastify/etag');
	web.register(etags);
	ctrl.register(etags);
}

if (conf.http.compress.enable) {
	const compress = require('@fastify/compress');
	web.register(compress, { encodings: conf.http.compress.encodings });
	ctrl.register(compress, { encodings: conf.http.compress.encodings });
}

ctrl.addContentTypeParser([ 'text/html', 'text/css' ], { parseAs: 'string' }, noop_content_processor);
ctrl.addContentTypeParser([ 'image/png' ], { parseAs: 'buffer' }, noop_content_processor);

web.setErrorHandler(error_handler);
ctrl.setErrorHandler(error_handler);

export function listen() {
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

function noop_content_processor(req: FastifyRequest, payload: string | Buffer, done: (err: Error | null, body?: any) => void) {
	done(null, payload);
}

function error_handler(error: Error | FastifyError, req: FastifyRequest, res: FastifyReply) {
	if (error instanceof HttpError) {
		res.status(error.status_code);
		res.send({ error: error.message });

		if (error.additional) {
			ctrl.log.error(error.additional);
		}

		return;
	}

	if ('statusCode' in error) {
		res.status(error.statusCode);
		res.send({
			error: error.message,
			validation: error.validation
		});

		return;
	}

	ctrl.log.error(error);

	res.status(500);
	res.type('application/json');
	res.send({ error: 'unknown error' });
}
