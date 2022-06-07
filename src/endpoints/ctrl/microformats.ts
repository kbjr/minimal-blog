
import { ctrl } from '../../http';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { parse_url_response } from '../../external-posts/parse';
import { read_as_entry, read_as_event } from '../../external-posts';

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
	const result = await parse_url_response(url, false);

	res.status(200);
	return result;
});

ctrl.post('/api/microformats/event', opts, async (req: Req, res) => {
	const url = req.body.trim();
	const result = await read_as_event(url, false);

	res.status(200);
	return result;
});

ctrl.post('/api/microformats/entry', opts, async (req: Req, res) => {
	const url = req.body.trim();
	const result = await read_as_entry(url, false);

	res.status(200);
	return result;
});
