
import { ctrl } from '../../http';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { read_url_as_microformats } from '../../external-posts/microformats';

type Req = FastifyRequest<{
	Body: string;
}>;

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['testing'],
		description: 'Testing endpoint that reads the given URL and parses Microformats data out of the response',
		body: { type: 'string' },
		response: {
			200: { type: 'object', additionalProperties: true }
		}
	}
};

ctrl.post('/api/microformats', opts, async (req: Req, res) => {
	const url = req.body.trim();
	const result = await read_url_as_microformats(url, true);

	res.status(200);
	return result;
});
