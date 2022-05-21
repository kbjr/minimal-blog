
import { ctrl } from '../../http';
import { RouteShorthandOptions } from 'fastify';
import { unique_id } from '../../storage/unique-id';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['meta'],
		description: 'Status endpoint mostly for confirming that the server is up and reachable',
		response: {
			200: {
				type: 'object',
				properties: {
					snowflake: {
						type: 'string',
						format: '\\d+'
					}
				}
			}
		}
	}
};

ctrl.get('/api/snowflake', opts, async (req, res) => {
	return { snowflake: unique_id().toString() };
});
