
import { ctrl } from './http';
import { conf } from './conf';

export type Logger = keyof Loggers;

export interface Loggers {
	sqlite: boolean;
	sqlite_sql: boolean;
	asset_files: boolean;
	cache: boolean;
	auth: boolean;
}

export function log_fatal(logger: Logger, message: string, ...args: any[]) {
	if (conf.logging.debug_loggers[logger]) {
		ctrl.log.fatal(message, ...args);
	}
}

export function log_error(logger: Logger, message: string, ...args: any[]) {
	if (conf.logging.debug_loggers[logger]) {
		ctrl.log.error(message, ...args);
	}
}

export function log_warn(logger: Logger, message: string, ...args: any[]) {
	if (conf.logging.debug_loggers[logger]) {
		ctrl.log.warn(message, ...args);
	}
}

export function log_info(logger: Logger, message: string, ...args: any[]) {
	if (conf.logging.debug_loggers[logger]) {
		ctrl.log.info(message, ...args);
	}
}

export function log_debug(logger: Logger, message: string, ...args: any[]) {
	if (conf.logging.debug_loggers[logger]) {
		ctrl.log.debug(message, ...args);
	}
}

export function debug_logger(logger: Logger, prefix = '') {
	return function log(message: string, ...args: any[]) {
		log_debug(logger, prefix + message, args);
	}
}
