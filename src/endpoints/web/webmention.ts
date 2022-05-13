
import { web } from '../../http';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

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
				source: {
					type: 'string',
					maxLength: 1000
				},
				target: {
					type: 'string',
					maxLength: 1000
				},
				vouch: {
					type: 'string',
					maxLength: 1000
				},
			},
			required: ['source', 'target']
		}
	}
};

web.post('/webmention', opts, async (req: Req, res) => {
	// SEE: https://www.w3.org/TR/webmention/#receiving-webmentions
	// TODO: Validate mention and register
	// TODO: Re-render post with new interaction

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
