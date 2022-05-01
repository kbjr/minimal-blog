
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { RouteShorthandOptions } from 'fastify';

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			204: { }
		}
	}
};

ctrl.patch('/settings', opts, async (req, res) => {
	// TODO: Update settings
	console.log(req.body);
	res.status(204);
});
