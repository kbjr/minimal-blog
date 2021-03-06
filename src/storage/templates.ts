
import { conf } from '../conf';
import { logger } from '../debug';
import { load_default_template } from './assets';
import { render as mustache_render, parse } from 'mustache';
import { settings, colors, feed, store, events, posts, links } from './store';
import { Post } from './posts';
import { icons } from '../icons';
import { Link } from './links';

const log = logger('asset_files');

export type Templates = Record<string, string>;
let templates: Partial<Templates>

const editable_ui_templates = [
	'page.html',
	'feed_content.html',
	'feed_meta.html',
	'post_card.html',
	'post_content.html',
	'post_meta.html',
	'comment_card.html',
	'comment_content.html',
	'comment_meta.html',
	'note_card.html',
	'note_content.html',
	'note_meta.html',
	'event_card.html',
	'event_content.html',
	'event_meta.html',
	'rsvp_card.html',
	'rsvp_content.html',
	'rsvp_meta.html',
	'not_found.html',
	'author_card.html',
	'mention_card.html',
	'mention_thread.html',
	'external_entry.html',
	'external_event.html',
	'base.css',
	'pages.css',
	'robots.txt',
];

export async function load() {
	log.info('loading all templates from storage');

	templates = await store.get_all_templates();

	for (const [name, template] of Object.entries(templates)) {
		log.info(`pre-parsing template ${name} with moustache`);
		parse(template);
	}

	for (const name of editable_ui_templates) {
		if (templates[name] == null) {
			log.info(`template ${name} not found in storage; Loading default from disk`);
			const content = await load_default_template(name);
			await update_template(name, content);
		}
	}

	events.emit('templates.load');
}

export async function reset_template(name: string) {
	log.info(`resetting template ${name} to default`);
	const content = await load_default_template(name, true);
	await update_template(name, content);
}

export function render(name: string, context: TemplateContext, partials: Record<string, string> = { }) : string {
	log.info(`rendering template ${name}`);
	return mustache_render(templates[name], context, partials);
}

export function get_template(name: string) {
	return templates[name];
}

export function update_template(name: string, content: string) {
	log.info(`updating template ${name}`);
	templates[name] = content;
	parse(content);
	events.emit('templates.update', name);
	return store.set_template(name, content);
}

export function page_partials(page_content: string, page_meta: string) {
	return Object.freeze({
		get page_content() {
			return get_template(page_content);
		},
		get page_specific_meta_tags() {
			return get_template(page_meta);
		},
		get author_card() {
			return get_template('author_card.html');
		},
		get post_card() {
			return get_template('post_card.html');
		},
		get comment_card() {
			return get_template('comment_card.html');
		},
		get note_card() {
			return get_template('note_card.html');
		},
		get event_card() {
			return get_template('event_card.html');
		},
		get rsvp_card() {
			return get_template('rsvp_card.html');
		},
		get mention_card() {
			return get_template('mention_card.html');
		},
		get mention_thread() {
			return get_template('mention_thread.html');
		},
		get external_entry() {
			return get_template('external_entry.html');
		},
		get external_event() {
			return get_template('external_event.html');
		}
	});
}

const site_context = Object.freeze({
	get url() { return conf.http.web_url; },
	get language() { return settings.get('language'); },
	get app_version() { return conf.app_version; },
	get favicon_type() { return settings.get('favicon_type') || 'image/png'; },
});

const colors_context = Object.freeze({
	get light() { return colors.get_light(); },
	get dark() { return colors.get_dark(); },
});

const feed_context = Object.freeze({
	get url_html() { return feed.get_url_html(); },
	get url_json_feed() { return feed.get_url_json_feed(); },
	get url_rss() { return feed.get_url_rss(); },
	get url_atom() { return feed.get_url_atom(); },
	get url_pingback() { return feed.get_url_pingback(); },
	get url_webmention() { return feed.get_url_webmention(); },
	get url_webmention_trusted() { return feed.get_url_webmention_trusted(); },
	get send_pingback_enabled() { return feed.send_pingback_enabled(); },
	get receive_pingback_enabled() { return feed.receive_pingback_enabled(); },
	get send_webmention_enabled() { return feed.send_webmention_enabled(); },
	get receive_webmention_enabled() { return feed.receive_webmention_enabled(); },
	get search_enabled() { return conf.data.enable_search; },
	get title() { return settings.get('feed_title'); },
	get description() { return settings.get('feed_description'); },
	get author_name() { return settings.get('author_name'); },
	get author_url() { return settings.get('author_url'); },
	get author_avatar() { return settings.get('author_avatar'); },
	get copyright_notice() { return settings.get('copyright_notice'); },
	get post_uri_format() { return settings.get('post_uri_format'); },
	get event_uri_format() { return settings.get('event_uri_format'); },
	get all_tags() { return posts.list_tags(); },
	get show_tag_counts() { return settings.get('show_tag_counts'); },
	get links() { return links.get_links().map((data) => new Link(data)); }
});

export class TemplateContext {
	public readonly site = site_context;
	public readonly colors = colors_context;
	public readonly feed = feed_context;
	public readonly icons = icons;
	public readonly icon_names = Object.keys(icons);

	constructor(
		public readonly page: Readonly<PageContext>,
		public readonly posts?: Post[],
		public readonly post?: Post
	) { }
}

export interface PageContext {
	page_name: string;
	url: string;
	title: string;
}
