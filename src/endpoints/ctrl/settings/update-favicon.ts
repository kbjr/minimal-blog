
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';

type Req = ReqUser & FastifyRequest<{
	Body: Buffer;
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['settings'],
		description: 'Updates the favicon to the image in the request body',
		security: [
			{ bearer: [ ] }
		],
		response: {
			204: { }
		}
	}
};

ctrl.put('/api/settings/favicon', opts, async (req: Req, res) => {
	require_auth(req);

	const favicon = req.body;
	const favicon_type = req.headers['content-type'].split(';')[0].trim();

	if (! favicon_type.startsWith('image/')) {
		http_error.throw_415_unsupported_media_type('Body must contain an image');
	}

	await store.settings.set('favicon', favicon);
	await store.settings.set('favicon_type', favicon_type as `image/${string}`);
	res.status(204);
});
