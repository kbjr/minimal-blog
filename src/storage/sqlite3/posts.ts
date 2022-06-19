
import { obj } from '../../util';
import { PostData, PostDataPatch, SearchResult, TagData } from '../posts';
import { run, get_one, get_all, sql, posts_pool } from './db';

type RawPostRecord = Omit<PostData, 'tags'> & {
	tags: string;
};

export async function get_all_posts() : Promise<PostData[]> {
	const sql = `${sql_get_posts} ${sql_get_posts__group_order_by}`;
	const db = await posts_pool.acquire();

	try {
		const posts = await get_all<RawPostRecord>(db, sql);
		return posts.map(split_tags);
	}

	finally {
		posts_pool.release(db);
	}
}

export async function get_post(uri_name: string) : Promise<PostData> {
	const sql = `${sql_get_posts} where uri_name = ? ${sql_get_posts__group_order_by}`;
	const db = await posts_pool.acquire();

	try {
		const post = await get_one<RawPostRecord>(db, sql, [ uri_name ]);
		return split_tags(post);
	}

	finally {
		posts_pool.release(db);
	}
}

function split_tags(record: RawPostRecord) {
	const mapped: PostData = record as any;
	mapped.tags = record.tags ? record.tags.split('\x1F') : [ ];
	return mapped;
}

const sql_get_posts = sql(`
select
	post.post_id                         as post_id,
	post.post_type                       as post_type,
	post.uri_name                        as uri_name,
	post.title                           as title,
	post.subtitle                        as subtitle,
	post.external_url                    as external_url,
	post.content_html                    as content_html,
	post.content_markdown                as content_markdown,
	post.image                           as image,
	post.banner_image                    as banner_image,
	post.is_draft                        as is_draft,
	post.date_published                  as date_published,
	post.date_updated                    as date_updated,
	post.date_event_start                as date_event_start,
	post.date_event_end                  as date_event_end,
	post.rsvp_type                       as rsvp_type,
	group_concat(tag.tag_name, char(31)) as tags
from posts post
left outer join tags tag
	on tag.post_id = post.post_id
`);

const sql_get_posts__group_order_by = sql(`
group by post.uri_name
order by post.date_published desc
`);

export async function create_post(data: PostDataPatch) : Promise<PostData> {
	const db = await posts_pool.acquire();
	const published = data.is_draft ? null : (new Date).toISOString();

	try {
		const result = await run(db, sql_create_post, {
			$post_type: data.post_type,
			$uri_name: data.uri_name,
			$title: data.title,
			$subtitle: data.subtitle,
			$external_url: data.external_url,
			$content_html: data.content_html,
			$content_markdown: data.content_markdown,
			$image: data.image,
			$banner_image: data.banner_image,
			$is_draft: data.is_draft ? 1 : 0,
			$date_published: published,
			$date_event_start: data.post_type === 'event' ? data.date_event_start : null,
			$date_event_end: data.post_type === 'event' ? data.date_event_end : null,
			$rsvp_type: data.post_type === 'rsvp' ? data.rsvp_type : null,
		});

		const post = obj({
			post_id: result.lastID,
			post_type: null,
			uri_name: null,
			title: null,
			subtitle: null,
			external_url: null,
			content_html: null,
			content_markdown: null,
			image: null,
			banner_image: null,
			is_draft: null,
			date_published: published,
			date_updated: null,
			date_event_start: null,
			date_event_end: null,
			rsvp_type: null,
			tags: null,
		});

		if (data.tags && data.tags.length) {
			await create_post_tags(result.lastID, data.tags);
		}

		else {
			post.tags = [ ];
		}

		return Object.assign({ }, post, data);
	}

	finally {
		posts_pool.release(db);
	}
}

const sql_create_post = sql(`
insert into posts
	(post_type, uri_name, title, subtitle, external_url, content_html, content_markdown, image, banner_image, is_draft, date_published, date_event_start, date_event_end, rsvp_type)
values
	($post_type, $uri_name, $title, $subtitle, $external_url, $content_html, $content_markdown, $image, $banner_image, $is_draft, $date_published, $date_event_start, $date_event_end, $rsvp_type)
`);

export async function update_post(data: PostData) : Promise<void> {
	const db = await posts_pool.acquire();

	try {
		await run(db, sql_update_post, {
			$post_id: data.post_id,
			$title: data.title,
			$subtitle: data.subtitle,
			$external_url: data.external_url,
			$content_html: data.content_html,
			$content_markdown: data.content_markdown,
			$image: data.image,
			$banner_image: data.banner_image,
			$is_draft: data.is_draft,
			$date_published: data.date_published,
			$date_event_start: data.date_event_start,
			$date_event_end: data.date_event_end,
			$rsvp_type: data.rsvp_type,
		});
	}

	finally {
		posts_pool.release(db);
	}
}

const sql_update_post = `
update posts
set title            = $title,
    subtitle         = $subtitle,
    external_url     = $external_url,
    content_html     = $content_html,
    content_markdown = $content_markdown,
    image            = $image,
    banner_image     = $banner_image,
    is_draft         = $is_draft,
    date_published   = $date_published,
    date_event_start = $date_event_start,
    date_event_end   = $date_event_end,
    rsvp_type        = $rsvp_type
where post_id = $post_id
`;

export async function delete_post(uri_name: string) : Promise<void> {
	// 
}

export async function move_post(old_uri_name: string, new_uri_name: string) : Promise<void> {
	// 
}

export async function list_all_tags() {
	const db = await posts_pool.acquire();

	try {
		return await get_all<TagData>(db, sql_list_all_tags);
	}

	finally {
		posts_pool.release(db);
	}
}

const sql_list_all_tags = sql(`
select tag_name, count(post_id) as tag_count
from tags
group by tag_name
`);

export async function create_post_tags(post_id: number, tag_names: string[]) {
	const db = await posts_pool.acquire();

	try {
		await Promise.all(
			tag_names.map(
				(tag_name) => run(db, sql_create_post_tag, [ tag_name, post_id ])
			)
		);
	}

	finally {
		posts_pool.release(db);
	}
}

const sql_create_post_tag = sql(`
insert into tags
	(tag_name, post_id)
values
	(?, ?)
`);

export async function delete_post_tags(post_id: number, tag_names: string[]) {
	const db = await posts_pool.acquire();

	try {
		await Promise.all(
			tag_names.map(
				(tag_name) => run(db, sql_delete_post_tag, [ tag_name, post_id ])
			)
		);
	}

	finally {
		posts_pool.release(db);
	}
}

const sql_delete_post_tag = sql(`
delete from tags
where tag_name = ?
  and post_id = ?
`);

export async function search_posts(query: string) {
	query = query.trim();

	if (! query) {
		return [ ];
	}

	const db = await posts_pool.acquire();

	try {
		return await get_all<SearchResult>(db, sql_search_posts, {
			$query: query
		});
	}

	finally {
		posts_pool.release(db);
	}
}

const sql_search_posts = `
select
	post.post_type       as post_type,
	post.uri_name        as uri_name,
	abs(bm25(posts_fts)) as search_score
from posts_fts search
left outer join posts post
	on post.post_id = search.rowid
where posts_fts match $query
	and post.is_draft = 0
order by bm25(posts_fts)
limit 50
`;
