
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';

type Req = ReqUser & FastifyRequest<{
	Body: {
		language?: string;
		theme_light?: string;
		theme_dark?: string;
		feed_title?: string;
		author_name?: string;
		author_url?: string;
		author_avatar?: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['settings'],
		description: 'Updates the given settings',
		security: [
			{ bearer: [ ] }
		],
		response: {
			204: { }
		},
		body: {
			type: 'object',
			properties: {
				language: { type: 'string' },
				theme_light: { type: 'string' },
				theme_dark: { type: 'string' },
				feed_title: { type: 'string' },
				author_name: { type: 'string' },
				author_url: { type: 'string' },
				author_avatar: { type: 'string' },
			},
			additionalProperties: false
		}
	}
};

ctrl.patch('/api/settings', opts, async (req: Req, res) => {
	require_auth(req);

	const entries = Object.entries(req.body);

	if (entries.length === 0) {
		http_error.throw_422_unprocessable_entity('No valid settings found in request body');
	}

	const promises: Promise<void>[] = [ ];

	for (const [ name, value ] of entries) {
		promises.push(store.settings.set(name as keyof Req['body'], value));
	}

	await Promise.all(promises);
	res.status(204);
});
