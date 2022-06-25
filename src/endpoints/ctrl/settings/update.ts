
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import * as http_error from '../../../http-error';
import { settings_schema } from './schema';
import { LangCode } from '../ui/i18n';

type Req = ReqUser & FastifyRequest<{
	Body: {
		language?: LangCode | string;
		ctrl_panel_language?: LangCode;
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
		body: Object.assign({ additionalProperties: false }, settings_schema)
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
