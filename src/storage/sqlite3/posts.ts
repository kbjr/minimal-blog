
import { obj } from '../../util';
import { PostData, PostDataPatch } from '../posts';
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
	mapped.tags = record.tags ? record.tags.split('\x31') : [ ];
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
	group_concat(tag.tag_name, char(31)) as tags
from posts post
left outer join tags tag
	on tag.post_id = post.post_id
`);

const sql_get_posts__group_order_by = sql(`
group by post.uri_name
order by post.date_published asc
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
		});

		return Object.assign(
			obj({ post_id: result.lastID }), data, {
				date_published: published,
				date_updated: null,
			}
		);
	}

	finally {
		posts_pool.release(db);
	}
}

const sql_create_post = sql(`
insert into posts
	(post_type, uri_name, title, subtitle, external_url, content_html, content_markdown, image, banner_image, is_draft, date_published)
values
	($post_type, $uri_name, $title, $subtitle, $external_url, $content_html, $content_markdown, $image, $banner_image, $is_draft, $date_published)
`);

export async function update_post(data: Partial<PostDataPatch>) : Promise<void> {
	// 
}

export async function delete_post(uri_name: string) : Promise<void> {
	// 
}

export async function move_post(old_uri_name: string, new_uri_name: string) : Promise<void> {
	// 
}

export async function list_all_tags() {
	const db = await posts_pool.acquire();

	try {
		const rows = await get_all<{ tag_name: string }>(db, sql_list_all_tags);
		return rows.map((row) => row.tag_name);
	}

	finally {
		posts_pool.release(db);
	}
}

const sql_list_all_tags = sql(`
select distinct tag_name
from tags
`);

async function create_post_tags(uri_name: string, tag_names: string[]) {
	const rows = tag_names.map((tag) => `($uri_name, ?)`).join(', ');
	const sql = sql_create_post_tag + ' ' + rows;
	const db = await posts_pool.acquire();

	try {
		run(db, sql, [
			...tag_names,
	
		])
	}

	finally {
		posts_pool.release(db);
	}
}

const sql_create_post_tag = sql(`
insert into tags
	(uri_name, tag_name)
values
`);

const sql_delete_post_tag = sql(`

`);
