
import { str_enum, arr, dict, str, one_of } from './json-schema';
import type { JSONSchema6, JSONSchema6Definition, JSONSchema6Object } from 'json-schema';

export interface JF2Feed {
	type: 'feed';
	lang?: string;
	url: string;
	name: string;
	summary?: string;
	photo?: string;
	author: JF2Card;
	children: JF2Entry[];
}

export interface JF2Card {
	type: 'card';
	lang?: string;
	name?: string;
	url?: string;
	photo?: string;
}

export interface JF2Entry {
	type: 'entry';
	lang?: string;
	uid: string;
	url: string;
	name?: string;
	author?: JF2Card | JF2Card[];
	photo?: string;
	featured?: string;
	content: string | {
		html?: string;
		text?: string;
	};
	published: string;
	updated?: string;
	start?: string;
	end?: string;
	'like-of'?: string;
	'in-reply-to'?: string;
	rsvp?: 'yes' | 'no' | 'maybe' | 'interested';
	category?: string |string[];
	audio?: JF2Media | JF2Media[];
	video?: JF2Media | JF2Media[];
	references?: Record<string, JF2Card | JF2Entry>;
}

export interface JF2Media {
	'content-type': string;
	url: string;
}

export const jf2_card_schema: JSONSchema6Definition = {
	type: 'object',
	properties: {
		type: str_enum([ 'card' ]),
		lang: str(),
		name: str(),
		url: str(),
		photo: str(),
	}
};

export const jf2_content_schema: JSONSchema6Definition = {
	type: 'object',
	properties: {
		html: str(),
		text: str()
	}
};

export const jf2_media_schema: JSONSchema6Definition = {
	type: 'object',
	properties: {
		'content-type': str(),
		url: str('uri')
	}
};

export const jf2_entry_schema: JSONSchema6Definition = {
	type: 'object',
	properties: {
		type: str_enum([ 'entry' ]),
		id: str('uri'),
		name: str(),
		url: str(),
		summary: str(),
		photo: str('uri'),
		featured: str('uri'),
		author: jf2_card_schema,
		content: one_of([ str(), jf2_content_schema ]),
		published: str('date-time'),
		updated: str('date-time'),
		start: str('date-time'),
		end: str('date-time'),
		category: arr(str()),
		'like-of': str('uri'),
		'in-reply-to': str('uri'),
		rsvp: str_enum([ 'yes', 'no', 'maybe', 'interested' ]),
		lang: str(),
		video: one_of([ jf2_media_schema, arr(jf2_media_schema) ]),
		audio: one_of([ jf2_media_schema, arr(jf2_media_schema) ]),
		references: dict(one_of([ null, jf2_card_schema ]))
	}
};

// NOTE: Creating circular references in the schemas
((jf2_entry_schema.properties.references as JSONSchema6Object).additionalProperties as JSONSchema6Object).oneOf[0] = jf2_entry_schema;

export const jf2_feed_schema: JSONSchema6 = {
	type: 'object',
	properties: {
		type: str_enum([ 'feed' ]),
		name: str(),
		url: str(),
		summary: str(),
		photo: str('uri'),
		author: jf2_card_schema,
		children: arr(jf2_entry_schema),
	}
};
