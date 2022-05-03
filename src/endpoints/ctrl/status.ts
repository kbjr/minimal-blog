
import { ctrl } from '../../http';
import { hostname } from 'os';
import { RouteShorthandOptions } from 'fastify';

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
					},
					time: {
						type: 'string'
					}
				}
			}
		}
	}
};

ctrl.get('/.status', opts, async (req, res) => {
	return {
		status: 'ok',
		hostname: hostname(),
		time: (new Date).toISOString(),
	};
});
