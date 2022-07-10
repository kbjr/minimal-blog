
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { rules_schema } from './schema';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

type Req = ReqUser & FastifyRequest<{
	Body: store.moderation_rules.ModerationRuleData[];
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['settings'],
		description: 'Updates the inbound mention moderation rules',
		security: [
			{ bearer: [ ] }
		],
		response: {
			204: { }
		},
		body: rules_schema
	}
};

ctrl.put('/api/moderation_rules', opts, async (req: Req, res) => {
	require_auth(req);
	await store.moderation_rules.update_rules(req.body);
	res.status(204);
});
