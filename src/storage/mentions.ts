
import { conf } from '../conf';
import { PostData, PostType } from './posts';
import { ExternalEntry, ExternalEvent } from '../external-posts';
import { obj, wrap_date } from '../util';
import { unique_id } from '../snowflake';
import { events, store } from './store';

export type MentionType = 'webmention' | 'pingback';

let mentions: MentionData[];
let mentions_index: Record<PostType, Record<string, MentionData[]>>;
let mentions_by_snowflake: Record<string, MentionData>;
let mentions_needing_moderation: MentionData[];
let mentions_needing_verification: MentionData[];

export async function load() {
	mentions = await store.get_all_mentions();
	mentions_index = obj({
		post: obj(),
		comment: obj(),
		note: obj(),
		event: obj(),
		rsvp: obj(),
	});
	mentions_by_snowflake = obj();
	mentions_needing_moderation = [ ];
	mentions_needing_verification = [ ];

	for (const mention of mentions) {
		if (! mentions_index[mention.post_type][mention.uri_name]) {
			mentions_index[mention.post_type][mention.uri_name] = [ mention ];
		}

		else {
			mentions_index[mention.post_type][mention.uri_name].push(mention);
		}

		mentions_by_snowflake[mention.snowflake] = mention;

		if (mention.needs_moderation) {
			mentions_needing_moderation.push(mention);
		}

		if (! mention.verified) {
			mentions_needing_verification.push(mention);
		}
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

export function get_mentions_needing_moderation(count: number, offset: number) {
	return mentions_needing_moderation.slice(offset, offset + count);
}

export function get_mentions_needing_verification(count: number, offset: number) {
	return mentions_needing_verification.slice(offset, offset + count);
}

export function get_mentions_needing_moderation_count() {
	return mentions_needing_moderation.length;
}

export function get_mentions_needing_verification_count() {
	return mentions_needing_verification.length;
}

export async function create_new_mention(post: PostData, data: EditableMentionData) {
	const mention: MentionData = {
		post_id: post.post_id,
		post_type: post.post_type,
		uri_name: post.uri_name,
		source_url: data.source_url,
		vouch_url: data.vouch_url,
		snowflake: unique_id().toString(),
		needs_moderation: data.needs_moderation,
		mention_type: data.mention_type,
		received_time: (new Date).toISOString(),
		updated_time: (new Date).toISOString(),
		verified: false,
	};

	// todo: actually create mention

	events.emit('mentions.create', mention);
}

export async function update_mention(snowflake: string, data: Partial<EditableMentionData>) {
	const mention = mentions_by_snowflake[snowflake];

	// todo: actually update mention

	events.emit('mentions.update', mention);
}

export async function delete_mention(snowflake: string) {
	const mention = mentions_by_snowflake[snowflake];

	// todo: actually delete mention

	events.emit('mentions.delete', mention);
}

export interface EditableMentionData {
	source_url: string;
	vouch_url?: string;
	needs_moderation: boolean;
	mention_type: MentionType;
	verified: boolean;
}

export interface MentionData {
	post_id: number;
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

	public get target_url() {
		const { post_type, uri_name } = this.data;
		return `${conf.http.web_url}/${post_type}s/${uri_name}`;
	}

	public get source_url() {
		return this.data.source_url;
	}

	public get author_name() {
		return this.external.author.author_name;
	}

	public get author_url() {
		return this.external.author.author_url;
	}

	public get author_avatar() {
		return this.external.author.author_avatar;
	}

	public get vouch_url() {
		return this.data.vouch_url;
	}

	public get local_mention_url() {
		return `${this.target_url}/mentions/#mention-${this.data.snowflake}`;
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

	public get mention_type_class() {
		if ('rsvp_type' in this.external) {
			if (this.data.post_type === 'event' && this.external.rsvp_type) {
				return 'u-rsvp';
			}
		}

		if (this.is_bookmark_of_this) {
			return 'u-bookmark';
		}

		if (this.is_repost_of_this) {
			return 'u-repost';
		}

		if (this.is_like_of_this) {
			return 'u-like';
		}

		return 'p-comment';
	}

	public get is_rsvp() {
		return this.data.post_type === 'event' && 'rsvp_type' in this.external && this.external.rsvp_type;
	}

	public get is_reply_to_this() {
		if ('in_reply_to' in this.external && this.external.in_reply_to) {
			const { target_url } = this;
			return this.external.in_reply_to.some((reply) => {
				return reply.url === target_url;
			});
		}
	}

	public get is_like_of_this() {
		if ('like_of' in this.external && this.external.like_of) {
			const { target_url } = this;
			return this.external.like_of.some((reply) => {
				return reply.url === target_url;
			});
		}
	}

	public get is_repost_of_this() {
		if ('repost_of' in this.external && this.external.repost_of) {
			const { target_url } = this;
			return this.external.repost_of.some((reply) => {
				return reply.url === target_url;
			});
		}
	}

	public get is_bookmark_of_this() {
		if ('bookmark_of' in this.external && this.external.bookmark_of) {
			const { target_url } = this;
			return this.external.bookmark_of.some((reply) => {
				return reply.url === target_url;
			});
		}
	}
}
