
import { conf } from '../conf';
import { PostType, Post } from './posts';
import { ExternalEntry, ExternalEvent } from '../external-posts';
import { obj, wrap_date } from '../util';
import { unique_id } from '../snowflake';

export type MentionType = 'webmention' | 'pingback';

let mentions: MentionData[];
let mentions_index: Record<PostType, Record<string, MentionData[]>>;
let mentions_by_snowflake: Record<string, MentionData>;

export async function load() {
	// mentions = await store.get_all_mentions();
	mentions = [
		{
			post_type: 'post',
			uri_name: 'running-rancher-k3s-on-raspberry-pi-4b-and-manjaro-linux',
			mention_type: 'webmention',
			needs_moderation: false,
			received_time: (new Date).toISOString(),
			snowflake: unique_id().toString(),
			source_url: 'http://localhost:3000/comments/318117335091151969',
			updated_time: (new Date).toISOString(),
			verified: true,
		},
	];
	mentions_index = obj({
		post: obj(),
		comment: obj(),
		note: obj(),
		event: obj(),
		rsvp: obj(),
	});
	mentions_by_snowflake = obj();

	for (const mention of mentions) {
		if (! mentions_index[mention.post_type][mention.uri_name]) {
			mentions_index[mention.post_type][mention.uri_name] = [ mention ];
		}

		else {
			mentions_index[mention.post_type][mention.uri_name].push(mention);
		}

		mentions_by_snowflake[mention.snowflake] = mention;
	}
}

export async function get_live_post_mentions(post_type: PostType, uri_name: string) {
	const mentions = mentions_index[post_type][uri_name];

	if (! mentions) {
		return [ ];
	}

	return mentions.filter((mention) => {
		return ! mention.needs_moderation && mention.verified;
	});
}

export interface MentionData {
	post_type: PostType;
	uri_name: string;
	source_url: string;
	vouch_url?: string;
	snowflake: string;
	needs_moderation: boolean;
	mention_type: MentionType;
	received_time: string;
	updated_time: string;
	verified: boolean;
}

export class Mention {
	public external: ExternalEntry | ExternalEvent;

	constructor(private readonly data: MentionData) { }

	public get source_url() {
		return this.data.source_url;
	}

	public get vouch_url() {
		return this.data.vouch_url;
	}

	public get local_mention_url() {
		return `${conf.http.web_url}/mentions/${this.data.snowflake}`;
	}

	public get snowflake() {
		return this.data.snowflake;
	}

	public get needs_moderation() {
		return this.data.needs_moderation;
	}

	public get mention_type() {
		return this.data.mention_type;
	}

	public get received() {
		return wrap_date(new Date(this.data.received_time));
	}

	public get updated() {
		return wrap_date(new Date(this.data.updated_time));
	}

	public get is_verified() {
		return this.data.verified;
	}
}
