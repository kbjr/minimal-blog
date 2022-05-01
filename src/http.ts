
import { conf } from './conf';
import fastify from 'fastify';

export const web = fastify({
	logger: true
});

export const ctrl = fastify({
	logger: true
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
