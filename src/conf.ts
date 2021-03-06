
import { Loggers } from './debug';
import { resolve as resolve_path } from 'path';

type http_url = `http${'s' | ''}://${string}`;

export namespace conf {
	/** The current version of the blog software; Should stay in sync with package.json */
	export const app_version = require('../package.json').version as string;
	// note: this ^ line is auto-replaced when building the container image, and this won't
	// work if the line's contents are changed; DO NOT EDIT

	/** Configuration for the HTTP server */
	export namespace http {
		/** The port the main web HTTP server will listen on */
		export const web_port = cast_int<number>(process.env.MB_HTTP_WEB_PORT, 3000);

		/** The port the control panel HTTP server will listen on */
		export const ctrl_port = cast_int<number>(process.env.MB_HTTP_CTRL_PORT, 3001);

		/** The URL the main web HTTP server will be accessed through */
		export const web_url = cast_str<http_url>(process.env.MB_HTTP_WEB_URL, `http://localhost:${web_port}`);

		/** The URL the control panel HTTP server will be accessed through */
		export const ctrl_url = cast_str<http_url>(process.env.MB_HTTP_CTRL_URL, `http://localhost:${ctrl_port}`);

		/** Controls whether or not the `/.status` endpoint will be accessible under the web URL */
		export const web_enable_status = cast_bool(process.env.MB_HTTP_WEB_ENABLE_STATUS, true);

		/** Controls whether or not Swagger API docs can be found at /api/docs on the control API */
		export const ctrl_enable_swagger = cast_bool(process.env.MB_HTTP_CTRL_SWAGGER, true);

		/** Configuration for HTTP response caching mechanisms */
		export namespace cache {
			/** Controls whether or not to send ETag headers on all HTTP responses */
			export const enable_etags = cast_bool(process.env.MB_CACHE_ENABLE_ETAGS, true);
			
			/** Controls whether or not to send Cache-Control headers on asset file HTTP responses */
			export const enable_cache_control = cast_bool(process.env.MB_CACHE_ENABLE_CACHE_CONTROL, true);
		}
	
		/** Configuration for HTTP response compression */
		export namespace compress {
			export const enum Encoding {
				gzip     = 'gzip',
				deflate  = 'deflate',
				br       = 'br',
				identity = 'identity',
			}

			/** Controls whether or not to compress all HTTP responses */
			export const enable = cast_bool(process.env.MB_COMPRESSION_ENABLE, true);

			/** Controls which compression encodings are enabled, and their priorities */
			export const encodings = cast_str_list<Encoding>(process.env.MB_COMPRESSION_ENCODINGS, null);
		}
	}

	/** Configuration for data storage */
	export namespace data {
		export enum StorageType {
			sqlite3 = 'sqlite3',
			// mysql   = 'mysql',
		}

		/** The persistent storage mechanism to use for blog data */
		export const storage_type = cast_str<StorageType>(process.env.MB_DATA_STORAGE_TYPE, StorageType.sqlite3);

		/** Should OpenSearch and the `/search` endpoint be enabled */
		export const enable_search = cast_bool(process.env.MB_DATA_ENABLE_SEARCH, true);

		/** Configuration for the sqlite3 storage implementation */
		export namespace sqlite3 {
			/** Path to the data storage directory */
			export const path = cast_str<string>(process.env.MB_DATA_DIR, '/data');
	
			/** Path to the file where the settings database is stored */
			export const settings_path = `${path}/settings.db`;
	
			/** Path to the file where the posts database is stored */
			export const posts_path = `${path}/posts.db`;

			/** Path to the directory where attachment files are stored */
			export const attachments_path = `${path}/attachments`;

			/** Minimum connection pool size for settings.db */
			export const settings_pool_min = 1;

			/** Maximum connection pool size for settings.db */
			export const settings_pool_max = 10;

			/** Minimum connection pool size for posts.db */
			export const posts_pool_min = 1;
			
			/** Maximum connection pool size for posts.db */
			export const posts_pool_max = 10;
		}

		export namespace caches {
			export namespace rendered_posts {
				export const max_age = 1000 * 60 * 60 * 24 * 365;
				export const max_size = 100;
				export const cycle_count = 50;
			}

			export namespace external_url {
				export const max_age = 1000 * 60 * 60;
				export const max_size = 200;
				export const cycle_count = 20;
			}

			export namespace external_event {
				export const max_age = 1000 * 60 * 60;
				export const max_size = 200;
				export const cycle_count = 20;
			}

			export namespace external_entry {
				export const max_age = 1000 * 60 * 60;
				export const max_size = 200;
				export const cycle_count = 20;
			}
		}
	}
	
	/** Static file asset configuration */
	export namespace assets {
		/** The directory where static files and default templates are loaded from */
		export const path = resolve_path(__dirname, '../assets');
		
		/** Directory where KaTeX static asset files are loaded from */
		export const katex_path = resolve_path(__dirname, '../node_modules/katex/dist');
	}

	/** Configuration for the control API authentication mechanism */
	export namespace auth {
		/**
		 * Used as a temporary first-time-setup password, to block the control panel from
		 * unauthorized users before the instance can be configured
		 */
		export const setup_code = cast_str<string>(process.env.MB_AUTH_SETUP_CODE, null);

		/** Time to live (TTL) to set on issued tokens */
		export const token_ttl = '3h';

		/** Minimum password complexity required for all users */
		export const minimum_password_complexity = 125;

		/** Path to key file to use for signing JWTs. */
		export const signing_key_file = cast_str<string>(process.env.MB_AUTH_SIGNING_KEY, null);

		/** Base-64 HMAC secret to use when signing tokens. */
		export const hmac_secret = cast_str<string>(process.env.MB_AUTH_HMAC_SECRET, null);

		/** Secret size (in bytes) to auto-generate for HMAC token signing (if no other signing method is provided) */
		export const hmac_secret_size = 128;

		/** Time in milliseconds to lock the login endpoint for after each login attempt */
		export const login_attempt_lock_duration = 1000;

		/** Configuration for the argon2 hasher used for hashing user passwords for storage */
		export namespace argon2 {
			export const hash_length = 100;
			export const time_cost = 3;
			export const memory_cost = 4096;
		}
	}

	/** Configuration to control logging output */
	export namespace logging {
		/** The various supported log levels, ordered from least to most verbose */
		export enum Level {
			none  = 'none',
			fatal = 'fatal',
			error = 'error',
			warn  = 'warn',
			info  = 'info',
			debug = 'debug',
			trace = 'trace',
		}

		/** The logging output level */
		export const level: Level = cast_str<Level>(process.env.MB_LOG_LEVEL, Level.info);

		/** Enables `pino-pretty` logging output for easier reading (not included in production build) */
		export const pretty = try_require('pino-pretty') && cast_bool(process.env.MB_LOG_PRETTY, true);

		/** Controls which additional debug loggers are enabled */
		export const debug_loggers = Object.freeze<Partial<Loggers>>({
			sqlite: false,
			sqlite_sql: false,
			asset_files: false,
			cache: false,
			auth: false,
			search: true,
			outbound_http: true,
		});
	}
}



// ===== Helpers =====

function cast_int<T extends number = number>(value: string, fallback: T = null) : T {
	if (value) {
		return parseInt(value, 10) as T;
	}

	return fallback;
}

function cast_str<T extends string = string>(value: string, fallback: T = null) : T {
	if (value) {
		return value as T;
	}

	return fallback;
}

function cast_str_list<T extends string = string>(value: string, fallback: T[] = null) : T[] {
	if (value) {
		return value.split(',') as T[];
	}

	return fallback;
}

function cast_bool(value: string, fallback: boolean = null) : boolean {
	if (value != null && value !== '') {
		const lower = value.toLowerCase();

		if (lower === '0' || lower === 'n' || lower === 'no' || lower === 'false' || lower === 'off') {
			return false;
		}

		if (lower === '1' || lower === 'y' || lower === 'yes' || lower === 'true' || lower === 'on') {
			return true;
		}

		console.warn(`cast_bool: value not recognized as boolean, using fallback; given: "${value}"`);
	}

	return fallback;
}

function try_require(module: string) {
	try {
		require(module);
		return true;
	}

	catch (error) {
		return false;
	}
}
