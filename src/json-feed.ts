
// https://jsonfeed.org/version/1.1
// application/feed+json

export const json_feed_schema = 'https://jsonfeed.org/version/1.1' as const;
export const json_feed_event_schema = 'TODO: JSON feed event extension schema' as const;
export const json_feed_rsvp_schema = 'TODO: JSON feed rsvp extension schema' as const;

export type JSONFeedCustomFields<T extends `_${string}`> = {
	[K in T]: object;
}

export interface JSONFeed extends JSONFeedCustomFields<`_${string}`> {
	/**
	 * version (required, string) is the URL of the version of the format the feed uses. This should
	 * appear at the very top, though we recognize that not all JSON generators allow for ordering.
	 */
	version: typeof json_feed_schema | string;

	/**
	 * title (required, string) is the name of the feed, which will often correspond to the name of the
	 * website (blog, for instance), though not necessarily.
	 */
	title: string;

	/**
	 * home_page_url (optional but strongly recommended, string) is the URL of the resource that the feed
	 * describes. This resource may or may not actually be a "home" page, but it should be an HTML page. If
	 * a feed is published on the public web, this should be considered as required. But it may not make sense
	 * in the case of a file created on a desktop computer, when that file is not shared or is shared only
	 * privately.
	 */
	home_page_url?: string;

	/**
	 * feed_url (optional but strongly recommended, string) is the URL of the feed, and serves as the unique
	 * identifier for the feed. As with home_page_url, this should be considered required for feeds on the public
	 * web.
	 */
	feed_url?: string;

	/**
	 * description (optional, string) provides more detail, beyond the title, on what the feed is about. A feed
	 * reader may display this text.
	 */
	description?: string;

	/**
	 * user_comment (optional, string) is a description of the purpose of the feed. This is for the use of people
	 * looking at the raw JSON, and should be ignored by feed readers.
	 */
	user_comment?: string;

	/**
	 * next_url (optional, string) is the URL of a feed that provides the next n items, where n is determined by the
	 * publisher. This allows for pagination, but with the expectation that reader software is not required to use it
	 * and probably won't use it very often. next_url must not be the same as feed_url, and it must not be the same
	 * as a previous next_url (to avoid infinite loops).
	 */
	next_url?: string;

	/**
	 * icon (optional, string) is the URL of an image for the feed suitable to be used in a timeline, much the way an
	 * avatar might be used. It should be square and relatively large — such as 512 x 512 pixels — so that it can be
	 * scaled-down and so that it can look good on retina displays. It should use transparency where appropriate, since
	 * it may be rendered on a non-white background.
	 */
	icon?: string;

	/**
	 * favicon (optional, string) is the URL of an image for the feed suitable to be used in a source list. It should be
	 * square and relatively small, but not smaller than 64 x 64 pixels (so that it can look good on retina displays).
	 * As with icon, this image should use transparency where appropriate, since it may be rendered on a non-white background.
	 */
	favicon?: string;

	/**
	 * authors (optional, array of objects) specifies one or more feed authors. The author object has several members. These
	 * are all optional — but if you provide an author object, then at least one is required
	 */
	authors?: JSONFeedAuthor[];

	/**
	 * language (optional, string) is the primary language for the feed in the format specified in RFC 5646. The value is
	 * usually a 2-letter language tag from ISO 639-1, optionally followed by a region tag. (Examples: en or en-US.)
	 */
	language?: string;

	/**
	 * expired (optional, boolean) says whether or not the feed is finished — that is, whether or not it will ever update
	 * again. A feed for a temporary event, such as an instance of the Olympics, could expire. If the value is true, then
	 * it's expired. Any other value, or the absence of expired, means the feed may continue to update.
	 */
	expired?: boolean;

	/**
	 * hubs (very optional, array of objects) describes endpoints that can be used to subscribe to real-time notifications
	 * from the publisher of this feed. Each object has a type and url, both of which are required.
	 *
	 * Traditional feed readers usually poll a web site for changes at a regular interval. This is fine for many applications,
	 * but there's a more efficient approach for applications that need to know the moment a feed changes. The top-level hubs
	 * array points to one or more services that can be used by feed aggregators to subscribe to changes to this feed. Those
	 * hubs can then send a notification to the application as soon as the feed is updated.
	 *
	 * The type field describes the protocol used to talk with the hub, such as "rssCloud" or "WebSub." When using WebSub,
	 * the value for the JSON Feed's feed_url is passed for the hub.topic parameter. For more information about WebSub, see
	 * {@link https://www.w3.org/TR/websub/|the specification at the W3C}.
	 */
	hubs?: JSONFeedHub[];

	/** items is an array, and is required. */
	items: JSONFeedItem[];
}

export interface JSONFeedAuthor extends JSONFeedCustomFields<`_${string}`> {
	/** name (optional, string) is the author's name. */
	name?: string;

	/**
		* url (optional, string) is the URL of a site owned by the author. It could be a blog, micro-blog, Twitter account,
		* and so on. Ideally the linked-to page provides a way to contact the author, but that's not required. The URL could
		* be a mailto: link, though we suspect that will be rare.
		*/
	url?: string;

	/**
		* avatar (optional, string) is the URL for an image for the author. As with icon, it should be square and relatively
		* large — such as 512 x 512 pixels — and should use transparency where appropriate, since it may be rendered on a
		* non-white background.
		*/
	avatar?: string;
}

export interface JSONFeedHub extends JSONFeedCustomFields<`_${string}`> {
	type: string;
	url: string;
}

export interface JSONFeedItem extends JSONFeedCustomFields<`_${string}`> {
	/**
	 * id (required, string) is unique for that item for that feed over time. If an item is ever updated, the id should be
	 * unchanged. New items should never use a previously-used id. Ideally, the id is the full URL of the resource described
	 * by the item, since URLs make great unique identifiers.
	 */
	id: string;

	/**
	 * url (optional, string) is the URL of the resource described by the item. It’s the permalink. This may be the same as
	 * the id — but should be present regardless.
	 */
	url?: string;

	/**
	 * external_url (very optional, string) is the URL of a page elsewhere. This is especially useful for linkblogs. If `url`
	 * links to where you’re talking about a thing, then `external_url` links to the thing you’re talking about.
	 */
	external_url?: string;

	/**
	 * title (optional, string) is plain text. Microblog items in particular may omit titles.
	 */
	title?: string;

	/**
	 * content_html and content_text are each optional strings — but one or both must be present. This is the HTML or plain
	 * text of the item. Important: the only place HTML is allowed in this format is in content_html. A Twitter-like service might
	 * use content_text, while a blog might use content_html. Use whichever makes sense for your resource. (It doesn’t even have
	 * to be the same for each item in a feed.)
	 */
	content_html?: string;

	/**
	 * content_html and content_text are each optional strings — but one or both must be present. This is the HTML or plain
	 * text of the item. Important: the only place HTML is allowed in this format is in content_html. A Twitter-like service might
	 * use content_text, while a blog might use content_html. Use whichever makes sense for your resource. (It doesn’t even have
	 * to be the same for each item in a feed.)
	 */
	content_text?: string;

	/**
	 * image (optional, string) is the URL of the main image for the item. This image may also appear in the content_html — if so,
	 * it’s a hint to the feed reader that this is the main, featured image. Feed readers may use the image as a preview (probably
	 * resized as a thumbnail and placed in a timeline).
	 */
	image?: string;

	/**
	 * banner_image (optional, string) is the URL of an image to use as a banner. Some blogging systems (such as Medium)
	 * display a different banner image chosen to go with each post, but that image wouldn’t otherwise appear in the content_html.
	 * A feed reader with a detail view may choose to show this banner image at the top of the detail view, possibly with the title
	 * overlaid.
	 */
	banner_image?: string;

	/**
	 * date_published (optional, string) specifies the date in RFC 3339 format. (Example: 2010-02-07T14:04:00-05:00.)
	 */
	date_published?: string;

	/**
	 * date_modified (optional, string) specifies the modification date in RFC 3339 format.
	 */
	date_modified?: string;

	/**
	 * authors (optional, array of objects) specifies one or more item authors. The author object has several members. These
	 * are all optional — but if you provide an author object, then at least one is required
	 */
	authors?: JSONFeedAuthor[];

	/**
	 * tags (optional, array of strings) can have any plain text values you want. Tags tend to be just one word, but they may
	 * be anything. Note: they are not the equivalent of Twitter hashtags. Some blogging systems and other feed formats call
	 * these categories.
	 */
	tags?: string[];

	/**
	 * language (optional, string) is the language for this item, using the same format as the top-level language field. The
	 * value can be different than the primary language for the feed when a specific item is written in a different language
	 * than other items in the feed.
	 */
	language?: string;

	/**
	 * attachments (optional, array) lists related resources. Podcasts, for instance, would include an attachment that’s an
	 * audio or video file.
	 */
	attachments?: JSONFeedAttachment[];
}

export interface JSONFeedAttachment extends JSONFeedCustomFields<`_${string}`> {
	/**
	 * url (required, string) specifies the location of the attachment.
	 */
	url: string;

	/**
	 * mime_type (required, string) specifies the type of the attachment, such as “audio/mpeg.”
	 */
	mime_type: string;

	/**
	 * title (optional, string) is a name for the attachment. Important: if there are multiple attachments, and two or more
	 * have the exact same title (when title is present), then they are considered as alternate representations of the same
	 * thing. In this way a podcaster, for instance, might provide an audio recording in different formats.
	 */
	title?: string;

	/**
	 * size_in_bytes (optional, number) specifies how large the file is.
	 */
	size_in_bytes?: number;

	/**
	 * duration_in_seconds (optional, number) specifies how long it takes to listen to or watch, when played at normal speed.
	 */
	duration_in_seconds?: number;
}

/**
 * Extension to support data related to Event items
 */
export interface JSONFeedItem_EventExtention {
	/**  */
	_event?: {
		$schema: typeof json_feed_event_schema;
		
		/**  */
		date_start?: string;
		
		/**  */
		date_end?: string;
	};
}

/**
 * Extension to support data related to RSVP items
 */
export interface JSONFeedItem_RsvpExtention {
	/**  */
	_rsvp?: {
		$schema: typeof json_feed_rsvp_schema;
		
		/**  */
		rsvp: 'yes' | 'no' | 'maybe' | 'interested';
	};
}
