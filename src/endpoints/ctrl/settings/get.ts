
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { RouteShorthandOptions } from 'fastify';

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			200: {
				type: 'object',
				properties: {
					language: {
						type: 'string'
					},
					theme_light: {
						type: 'string'
					},
					theme_dark: {
						type: 'string'
					},
					feed_title: {
						type: 'string'
					}
				}
			}
		}
	}
};

ctrl.get('/settings', opts, async (req, res) => {
	return store.settings.get_all();
});
