
import { web } from '../../http';
import { conf } from '../../conf';
import { store } from '../../storage';
import { throw_404_not_found } from '../../http-error';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { create_icalendar, ICalAttendeeData, ICalEventData/* , ICalAttendeeStatus */ } from '../../icalendar';

const ical_prod_id = '//jbrumond.me//minimal-blog//EN';

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

web.get('/events.ics', async (req, res) => {
	const calendar = await get_recent_events_calendar();

	res.type('text/calendar; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(calendar);
});

web.get('/event/:post_uri_name/event.ics', opts, async (req: Req, res) => {
	const calendar = await get_event_calendar(req.params.post_uri_name);

	res.type('text/calendar; charset=utf-8');
	res.header('content-language', store.settings.get('language'));
	res.send(calendar);
});

// todo: implement caching?
async function get_event_calendar(uri_name: string) {
	const data = store.posts.get_post('event', uri_name);

	if (! data) {
		throw_404_not_found('event not found');
	}
	
	const post = new store.posts.Post(data);

	// const mentions_data = await store.mentions.get_live_post_mentions(post.post_type, post.uri_name);
	// post.mentions = await Promise.all(
	// 	mentions_data.map(async (data) => {
	// 		const mention = new store.mentions.Mention(data);
	// 		mention.external = await read_as_entry(data.source_url);
	// 		mention.external.context = post;
	// 		return mention;
	// 	})
	// );

	return create_icalendar({
		prodId: ical_prod_id,
		url: post.post_url,
	}, ical_event(post));
}

// todo: implement caching?
async function get_recent_events_calendar() {
	const data = store.posts.get_posts(50, null, null, 'event', false);
	const events = await Promise.all(
		data.map(async (data) => {
			const post = new store.posts.Post(data);

			// const mentions_data = await store.mentions.get_live_post_mentions(post.post_type, post.uri_name);
			// post.mentions = await Promise.all(
			// 	mentions_data.map(async (data) => {
			// 		const mention = new store.mentions.Mention(data);
			// 		mention.external = await read_as_entry(data.source_url);
			// 		mention.external.context = post;
			// 		return mention;
			// 	})
			// );

			return ical_event(post);
		})
	);

	return create_icalendar({
		prodId: ical_prod_id,
		url: `${conf.http.web_url}/event`,
	}, events);
}

function ical_event(post: store.posts.Post) {
	const event: ICalEventData = {
		id: post.post_url,
		summary: post.title,
		description: post.subtitle || void 0,
		start: post.date_event_start_iso,
		end: post.date_event_end_iso,
		url: post.post_url,
		created: post.date_published,
		lastModified: post.date_updated || post.date_published,
		organizer: {
			name: store.settings.get('author_name'),
		},
		// attendees: post.mentions.flatMap((mention) : ICalAttendeeData | ICalAttendeeData[] => {
		// 	if (mention.is_rsvp && mention.is_reply_to_this) {
		// 		const ext = mention.external as ExternalEntry;
		// 		const status = ext.rsvp_type === 'yes'
		// 			? 'ACCEPTED' as const
		// 			: ext.rsvp_type === 'no'
		// 				? 'DECLINED' as const
		// 				: ext.rsvp_type === 'maybe'
		// 					? 'TENTATIVE' as const
		// 					: 'NEEDS-ACTION' as const;

		// 		return {
		// 			name: mention.author_name,
		// 			rsvp: ext.rsvp_type === 'yes',
		// 			status: status as ICalAttendeeStatus
		// 		};
		// 	}

		// 	return [ ];
		// }),
	};

	return event;
}
