
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { require_auth, ReqUser } from '../../../auth';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { mentions_update_req_body_schema } from './schema';

type Req = ReqUser & FastifyRequest<{
	Body: store.moderation_rules.ModerationRuleData[];
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['mentions'],
		description: 'Updates the metadata for the given mention',
		security: [
			{ bearer: [ ] }
		],
		response: {
			204: { }
		},
		body: mentions_update_req_body_schema
	}
};

ctrl.patch('/api/mentions/:mention_snowflake', opts, async (req: Req, res) => {
	require_auth(req);
	// await store.moderation_rules.update_rules(req.body);
	res.status(204);
});
