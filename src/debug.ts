
import { ctrl } from './http';
import { conf } from './conf';
import type { FastifyLoggerInstance } from 'fastify';

export type Logger = keyof Loggers;

export interface Loggers {
	sqlite: boolean;
	sqlite_sql: boolean;
	asset_files: boolean;
	cache: boolean;
	auth: boolean;
	outbound_http: boolean;
}

export function logger(name: Logger) {
	return conf.logging.debug_loggers[name]
		? ctrl.log.child({ logger: name })
		: noop_logger();
}

function noop_logger() :FastifyLoggerInstance {
	return <FastifyLoggerInstance> {
		fatal(...args: any[]) { },
		error(...args: any[]) { },
		warn(...args: any[]) { },
		info(...args: any[]) { },
		debug(...args: any[]) { },
		trace(...args: any[]) { },
		child(...args: any[]) { return noop_logger(); },
	};
}
