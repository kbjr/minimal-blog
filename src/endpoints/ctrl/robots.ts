
import { ctrl } from '../../http';
import { assets } from '../../storage';
import { RouteShorthandOptions } from 'fastify';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['meta']
	}
};

ctrl.get('/robots.txt', opts, async (req, res) => {
	res.type('text/plain; charset=utf-8');
	return assets.load_control_panel_asset('robots.txt');
});
