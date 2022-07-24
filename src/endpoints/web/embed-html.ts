
import { web } from '../../http';
import { store } from '../../storage';
import { obj, str, str_enum } from '../../json-schema';
import { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';

type Req = FastifyRequest<{
	Params: {
		post_uri_name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		params: obj({
			post_uri_name: str()
		})
	}
};

web.get('/post/:post_uri_name/embed', opts, embed_endpoint('post'));
web.get('/comment/:post_uri_name/embed', opts, embed_endpoint('comment'));
web.get('/note/:post_uri_name/embed', opts, embed_endpoint('note'));
web.get('/event/:post_uri_name/embed', opts, embed_endpoint('event'));
web.get('/rsvp/:post_uri_name/embed', opts, embed_endpoint('rsvp'));

function embed_endpoint(post_type: store.posts.PostType) {
	return async (req: Req, res: FastifyReply) => {
		const html = '<p>Entry embeds not yet supported</p>';
	
		res.type('text/html; charset=utf-8');
		res.header('content-language', store.settings.get('language'));
		res.send(html);
	};
}
