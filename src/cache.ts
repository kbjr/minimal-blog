
import { dict } from './util';
import { store } from './storage';
import { load_asset } from './storage/assets';
import { render } from 'mustache';
import { conf } from './conf';

class CacheEntry<T> {
	public score = 2;
	public time = Date.now();

	constructor(
		public key: string,
		public data: T,
		public max_age: number
	) { }

	public get age() {
		return Date.now() - this.time;
	}

	public get is_expired() {
		return this.age > this.max_age;
	}
}

export class Cache<T> {
	public index = dict<string, CacheEntry<T>>();
	public sorted = new Array<CacheEntry<T>>();
	public cycle_index = this.cycle_count;
	public half_max_size = this.max_size / 2;

	constructor(
		public readonly max_size: number,
		public readonly max_age: number,
		public readonly cycle_count: number
	) {
		if (max_age > 0 && isFinite(max_age)) {
			this.auto_sweep();
		}
	}

	// Periodically run a sweep, even if there is no activity, to
	// allow memory to be reclaimed from expired cache entries
	protected auto_sweep() {
		this.sweep_cache();
		setTimeout(() => this.auto_sweep(), this.max_age);
	}
	
	public get_from_cache(key: string) {
		const entry = this.index[key];
	
		if (! entry) {
			return null;
		}
	
		// Make sure the cache entry isn't expired before returning it
		if (entry.is_expired) {
			const index = this.sorted.findIndex((found) => found === entry);
			this.sorted.splice(index, 1);
			delete this.index[entry.key];
			return null;
		}
	
		// Increase the score of anything that is accessed so we can
		// tell what entries are most worth keeping in cache
		entry.score++;
		return entry.data;
	}
	
	public store_to_cache(key: string, data: T, max_age?: number) {
		if (this.index[key]) {
			this.index[key].time = Date.now();
			this.index[key].data = data;
		}
	
		else {
			const entry = new CacheEntry(key, data, max_age || this.max_age);
		
			this.sorted.push(entry);
			this.index[key] = entry;
		}
	
		if (this.sorted.length >= this.half_max_size) {
			// Decrement on each store() until we reach 0, then do a
			// sweep and reset the counter
			if (! this.cycle_index--) {
				this.cycle_index = this.cycle_count;
		
				this.sweep_cache();
			}
		
			// If at any point we still reach the max cache size, just
			// drop the oldest records to make space
			if (this.sorted.length >= this.max_size) {
				this.clear_oldest();
			}
		}
	}

	public invalidate(key: string) {
		if (this.index[key]) {
			delete this.index[key];

			for (let i = 0; i < this.sorted.length; i++) {
				if (this.sorted[i].key === key) {
					this.sorted.splice(i, 1);
					break;
				}
			}
		}
	}

	public invalidate_all() {
		this.index = dict();
		this.sorted.length = 0;
	}
	
	/**
	 * Tier-one cache clear; Checks entry scores for things that
	 * don't look like they've received frequent/recent use, or that
	 * are expired
	 */
	public sweep_cache() {
		for (let i = 0; i < this.sorted.length; i++) {
			const entry = this.sorted[i];
			const too_old = entry.is_expired;
	
			if (! too_old) {
				entry.score = ((entry.score / 2) | 0) - 1;
			}
	
			if (too_old || entry.score < 0) {
				delete this.index[entry.key];
				this.sorted.splice(i--, 1);
			}
		}
	}
	
	/**
	 * Tier-two cache clear; Removes the oldest half of entries
	 * from the cache regardless of usage stats
	 */
	public clear_oldest() {
		const half = (this.sorted.length / 2) | 0;
		const evicted = this.sorted.splice(0, half);
	
		for (const entry of evicted) {
			delete this.index[entry.key];
		}
	}
}

export interface ExpirationTriggers {
	settings?: boolean;
	colors?: boolean;
	templates?: boolean;
	posts?: boolean;
	links?: boolean;
}

export function rendered_post_cache(post_type: store.posts.PostType) {
	const post_cache = new Cache(
		conf.data.caches.rendered_posts.max_age,
		conf.data.caches.rendered_posts.max_size,
		conf.data.caches.rendered_posts.cycle_count,
	);

	store.events.on('settings.load', () => post_cache.invalidate_all());
	store.events.on('settings.update', () => post_cache.invalidate_all());

	store.events.on('templates.load', () => post_cache.invalidate_all());
	store.events.on('templates.update', (template: string) => {
		if (['page.html', 'author_card.html', `${post_type}_content.html`, `${post_type}_meta.html`].includes(template)) {
			post_cache.invalidate_all()
		}
	});

	store.events.on('posts.load', () => post_cache.invalidate_all());
	store.events.on('posts.update', (post: store.posts.PostData) => {
		if (post.post_type === post_type) {
			post_cache.invalidate(post.uri_name);
		}
	});
	store.events.on('posts.delete', (post: store.posts.PostData) => {
		if (post.post_type === post_type) {
			post_cache.invalidate(post.uri_name);
		}
	});

	store.events.on('links.load', () => post_cache.invalidate_all());
	store.events.on('links.update', () => post_cache.invalidate_all());

	return post_cache;
}

export function rendered_asset_cache(asset: string, context: object, partials: Record<string, string>, triggers: ExpirationTriggers = { }) {
	let cache: string;
	set_invalidate_triggers(invalidate, triggers);

	function invalidate() {
		cache = void 0;
	}

	async function render_asset() {
		const raw = await load_asset(asset);
		return render(raw, context, partials);
	}

	return async function() {
		if (cache) {
			return cache;
		}

		return cache = await render_asset();
	}
}

export function rendered_template_cache(template: string, get_context: () => Promise<store.templates.TemplateContext>, partials: Record<string, string>, triggers: ExpirationTriggers = { }) {
	let cache: string;
	set_invalidate_triggers(invalidate, triggers);

	function invalidate() {
		cache = void 0;
	}

	async function render_template() {
		const context = await get_context();
		return store.templates.render(template, context, partials);
	}

	return async function() {
		if (cache) {
			return cache;
		}

		return cache = await render_template();
	}
}

export function custom_cache(func: () => Promise<string>, triggers: ExpirationTriggers = { }) {
	let cache: string;
	set_invalidate_triggers(invalidate, triggers);

	function invalidate() {
		cache = void 0;
	}

	return async function() {
		if (cache) {
			return cache;
		}

		return cache = await func();
	}
}

function set_invalidate_triggers(invalidate: () => void, triggers: ExpirationTriggers) {
	if (triggers.settings) {
		store.events.on('settings.load', invalidate);
		store.events.on('settings.update', invalidate);
	}

	if (triggers.colors) {
		store.events.on('colors.load', invalidate);
		store.events.on('colors.update', invalidate);
	}

	if (triggers.templates) {
		store.events.on('templates.load', invalidate);
		store.events.on('templates.update', invalidate);
	}
	
	if (triggers.posts) {
		store.events.on('posts.create', invalidate);
		store.events.on('posts.update', invalidate);
		store.events.on('posts.delete', invalidate);
	}

	if (triggers.links) {
		store.events.on('links.create', invalidate);
		store.events.on('links.update', invalidate);
	}
}
