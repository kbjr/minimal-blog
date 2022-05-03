
import { store } from './store';
import { EventEmitter } from 'events';
import { conf } from '../conf';

export class Feed extends EventEmitter {
	// 

	get url_html() {
		return `${conf.http.web_url}`;
	}
	
	get url_json_feed() {
		return `${conf.http.web_url}/feed.json`;
	}
	
	get url_rss() {
		return `${conf.http.web_url}/feed.rss.xml`;
	}
	
	get url_atom() {
		return `${conf.http.web_url}/feed.atom.xml`;
	}

	public get_posts(count: number, tagged_with?: string, before?: string) {
		// 
	}
}

export interface PostData {
	uri_name: string;
	is_draft: 1 | 0;
	title: string;
	external_url: string;
	subtitle: string;
	content_html: string;
	content_text: string;
	image: string;
	banner_image: string;
	date_published: string;
	date_modified: string;
	tags: string[];
	authors: AuthorData[];
	// attachments: any[];
}

export interface AuthorData {
	id: number;
	name?: string;
	url?: string;
	avatar?: string;
}
