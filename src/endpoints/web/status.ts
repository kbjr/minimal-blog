
import { web } from '../../http';
import { conf } from '../../conf';
import { hostname } from 'os';
import { RouteShorthandOptions } from 'fastify';

if (conf.http.web_enable_status) {
	const opts: RouteShorthandOptions = {
		schema: {
			response: {
				200: {
					type: 'object',
					properties: {
						status: {
							type: 'string',
							enum: ['ok']
						},
						hostname: {
							type: 'string'
						}
					}
				}
			}
		}
	};
	
	web.get('/.status', opts, async (req, res) => {
		return {
			status: 'ok',
			hostname: hostname()
		};
	});
}
