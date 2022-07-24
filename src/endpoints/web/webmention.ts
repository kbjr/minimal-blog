
import { URL } from 'url';
import { web } from '../../http';
import { conf } from '../../conf';
import { store } from '../../storage';
import { str } from '../../json-schema';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { throw_403_forbidden, throw_404_not_found } from '../../http-error';
import { parse_local_url } from '../../external-posts/local';

type Req = FastifyRequest<{
	Body: {
		source: string;
		target: string;
		vouch?: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			202: {
				type: 'object',
				properties: {
					message: { type: 'string' },
				},
			}
		},
		body: {
			type: 'object',
			properties: {
				source: str('uri'),
				target: str('uri'),
				vouch: str('uri'),
			},
			required: ['source', 'target']
		}
	}
};

web.post('/webmention', opts, async (req: Req, res) => {
	if (! store.settings.get('receive_webmention')) {
		throw_404_not_found('not found');
	}

	// SEE: https://www.w3.org/TR/webmention/#receiving-webmentions
	// TODO: Validate mention and register
	// TODO: Re-render post with new interaction

	if (! req.body.target.startsWith(conf.http.web_url)) {
		throw_403_forbidden('target URL not valid');
	}
	
	const source = new URL(req.body.source);
	const target = parse_local_url(req.body.target);
	const vouch = req.body.vouch ? new URL(req.body.vouch) : null;

	if (store.settings.get('https_only')) {
		if (source.protocol === 'http') {
			throw_403_forbidden('insecure source URL not allowed');
		}

		if (vouch && vouch.protocol === 'http') {
			throw_403_forbidden('insecure vouch URL not allowed');
		}
	}

	if (target.type !== 'entry') {
		throw_404_not_found('target URL not found or not a valid target');
	}

	const post = store.posts.get_post(target.post_type, target.uri_name);

	if (! post || post.is_draft) {
		throw_404_not_found('target URL not found or not a valid target');
	}

	// todo: check moderation rules to determine what to do based on the source
	// todo: check if we already know about this mention
	//   - if we do, and its blocked, just send the 202 but don't do anything else
	//   - if we do, and its not blocked... (re-verify?)

	await store.mentions.create_new_mention(post, {
		mention_type: 'webmention',
		verified: false,
		blocked: false,
		// todo: depends on the source
		needs_moderation: false,
		source_url: req.body.source,
		vouch_url: req.body.vouch,
	});

	res.status(202);
	return {
		message: 'WebMention was submitted for review successfully.'
	};
});



// ===== Trusted Sources List =====

const opts_trusted: RouteShorthandOptions = {
	schema: {
		response: {
			200: {
				type: 'object',
				properties: {
					$comment: { type: 'string' },
					trusted_sources: {
						type: 'array',
						items: { type: 'string' }
					}
				}
			}
		}
	}
};

const comment_trusted
	= 'This file contains a list of trusted sources for a WebMention Vouch '
	+ '(see https://indieweb.org/Vouch); To be accepted, a vouch URL must '
	+ 'start with one of these.'
	;

web.get('/webmention/trusted', opts_trusted, async (req, res) => {
	res.status(200);
	return {
		$comment: comment_trusted,
		// TODO: Trusted sources should come from settings.db
		trusted_sources: [ ]
	};
});
