
import { web } from '../../http';
import { store } from '../../storage';
import { rendered_post_cache } from '../../cache';
import { throw_404_not_found } from '../../http-error';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { read_as_event } from '../../external-posts';

const partials = store.templates.page_partials('rsvp_content.html', 'rsvp_meta.html');
const post_cache = rendered_post_cache('rsvp');

type Req = FastifyRequest<{
	Params: {
		post_uri_name: string;
	};
}>;

const opts: RouteShorthandOptions = {
	schema: {
		params: {
			type: 'object',
			properties: {
				post_uri_name: { type: 'string' }
			}
		}
	}
};

web.get('/rsvps/:post_uri_name', opts, async (req: Req, res) => {
	const html = await get_post_html(req.params.post_uri_name);

	res.type('text/html; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(html);
});

async function get_post_html(uri_name: string) {
	const cached = post_cache.get_from_cache(uri_name);

	if (cached) {
		return cached;
	}

	const data = store.posts.get_post('rsvp', uri_name);

	if (! data) {
		throw_404_not_found('rsvp not found');
	}

	const html = render_template(uri_name);
	post_cache.store_to_cache(uri_name, html);
	return html;
}

async function render_template(uri_name: string) {
	const context = await create_context(uri_name);
	return store.templates.render('page.html', context, partials);
}

async function create_context(uri_name: string) {
	const data = store.posts.get_post('rsvp', uri_name);
	const post = new store.posts.Post(data);

	// Comments should always have an `external_url`, but just for safety
	if (data.external_url) {
		post.external_data = await read_as_event(data.external_url);
	}

	// fixme: These strings should come from a template or setting somewhere
	//   so they can be controlled by the user
	const event = 'an event';
	// const event = post.external_data ? `"${post.external_data.title}"` : 'an event';
	const title = `${post.author_name} posted an RSVP to ${event} on ${post.date_published_utc}`;

	const page = {
		page_name: 'rsvp',
		get title() {
			return title;
		},
		get url() {
			return post.post_url;
		}
	};

	return new store.templates.TemplateContext(page, null, post);
}
