
/**
 * 
 *
 * @link https://www.rssboard.org/rss-specification#requiredChannelElements
 * @link https://www.rssboard.org/rss-specification#optionalChannelElements
 */
 export interface RSSChannelData {
	/**
	 * The name of the channel. It's how people refer to your service. If you have an HTML
	 * website that contains the same information as your RSS file, the title of your channel
	 * should be the same as the title of your website.
	 */
	title: string;

	/** The URL to the HTML website corresponding to the channel. */
	link: string;

	/** Phrase or sentence describing the channel. */
	description: string;

	/**
	 * The language the channel is written in.
	 *
	 * @link https://www.rssboard.org/rss-language-codes
	 */
	language?: 'en-us' | string;

	/** Copyright notice for content in the channel. */
	copyright?: string;

	/**
	 * The publication date for the content in the channel. All date-times in RSS conform to
	 * the Date and Time Specification of RFC 822
	 */
	pubDate?: string;

	/** The last time the content of the channel changed. */
	lastBuildDate?: string;

	/** Specify one or more categories that the channel belongs to. */
	catgories?: {
		domain?: string;
		category: string;
	}[];

	/** A URL that points to the documentation for the format used in the RSS file. */
	docs?: string;

	/** A string indicating the program used to generate the channel. */
	generator?: string;
	
	/** Email address for person responsible for editorial content. */
	managingEditor?: string;

	/** Email address for person responsible for technical issues relating to channel. */
	webMaster?: string;

	/**
	 * Allows processes to register with a cloud to be notified of updates to the channel, implementing
	 * a lightweight publish-subscribe protocol for RSS feeds.
	 */
	cloud?: {
		domain: string;

		/** The client's TCP port */
		port: number;

		/** The client's remote procedure call path */
		path: string;

		/** The name of the remote procedure the cloud should call on the client upon an update */
		registerProcedure: string;

		/** The string "xml-rpc" if the client employs XML-RPC, "soap" for SOAP and "http-post" for REST. */
		protocol: 'xml-rpc' | 'soap' | 'http-post';
	};

	/** Number of minutes that indicates how long a channel can be cached before refreshing from the source. */
	ttl?: number;

	/** Specifies a GIF, JPEG or PNG image that can be displayed with the channel. */
	image?: {
		/** URL of a GIF, JPEG or PNG image that represents the channel. */
		url: string;

		/** describes the image, it's used in the ALT attribute of the HTML <img> tag when the channel is rendered in HTML. */
		title: string;

		/** URL of the site, when the channel is rendered, the image is a link to the site. */
		link: string;
	};

	/**
	 * A hint for aggregators telling them which hours they can skip. This element contains up to 24 <hour> sub-elements whose value
	 * is a number between 0 and 23, representing a time in GMT, when aggregators, if they support the feature, may not read the
	 * channel on hours listed in the <skipHours> element. The hour beginning at midnight is hour zero.	
	 */
	skipHours?: number[];

	/**
	 * A hint for aggregators telling them which days they can skip. This element contains up to seven <day> sub-elements whose value is
	 * "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" or "Sunday". Aggregators may not read the channel during days
	 * listed in the <skipDays> element.
	 */
	skipDays?: number[];

	items: RSSItemData[];
}

export interface RSSItemData {
	/** The title of the item. */
	title?: string;

	/** The URL of the item. */
	link?: string;

	/** The item synopsis. */
	description?: string;

	/** Email address of the author of the item. */
	author?: string;

	/** Includes the item in one or more categories */
	catgories?: {
		domain?: string;
		category: string;
	}[];

	/** URL of a page for comments relating to the item. */
	comments?: string;

	/** Describes a media object that is attached to the item. */
	enclosures?: {
		/** Where the enclosure is located */
		url: string;

		/** Length of the enclosure, in bytes */
		length: number;

		/** Type of the enclosure, as a standard MIME type */
		type: string;
	}[];

	/** Indicates when the item was published. */
	pubDate?: string;

	/** A string that uniquely identifies the item. */
	guid?: string;

	/** The RSS channel that the item came from. */
	source?: {
		url: string;
		title: string;
	};
}
