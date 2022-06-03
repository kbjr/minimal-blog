
import 'fastify';
import { conf } from './conf';

declare module 'fastify' {
	export interface FastifySchema {
		description?: string;
		tags?: string[];
		summary?: string;
		security?: unknown;
		consumes?: string[];
		produces?: string[];
	}

	export interface FastifyInstance {
		swagger() : unknown;
	}
}

export const swagger_opts = {
	exposeRoute: true,
	routePrefix: '/api/docs',
	openapi: {
		info: {
			title: 'Minimal Blog: Control API',
			description: '',
			version: '0.1.0'
		},
		servers: [{
			url: conf.http.ctrl_url
		}],
		tags: [
			{ name: 'meta', description: 'Various meta / status endpoints' },
			{ name: 'auth', description: 'Endpoints related to authentication, tokens, and passwords' },
			{ name: 'settings', description: 'Endpoints for managing application Settings' },
			{ name: 'users', description: 'Endpoints for managing Users' },
			{ name: 'posts', description: 'Endpoints to read and write Post information' },
			{ name: 'templates', description: 'Endpoints for managing page Templates' },
			{ name: 'themes', description: 'Endpoints for managing Color Themes' },
			{ name: 'links', description: 'Endpoints for managing sidebar links' },
			{ name: 'interactions', description: 'Endpoints for managing Interactions like Pingbacks and WebMentions' },
		],
		consumes: [
			'application/json'
		],
		produces: [
			'application/json'
		],
		staticCSP: true,
		transformStaticCSP: (header) => header,
		components: {
			securitySchemes: {
				bearer: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				}
			}
		}
	}
};
