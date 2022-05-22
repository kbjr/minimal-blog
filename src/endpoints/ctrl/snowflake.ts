
import { ctrl } from '../../http';
import { RouteShorthandOptions } from 'fastify';
import { unique_id } from '../../snowflake';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['meta'],
		description: 'Generates and returns a new Snowflake UID',
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
