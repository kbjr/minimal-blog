
const { http_get, http_post, http_patch } = require('./http');

exports.APIClient = class APIClient {
	#token;
	base_url;

	constructor(base_url) {
		this.base_url = base_url;
	}

	async first_time_setup(new_username, new_password) {
		const req_body = JSON.stringify({
			first_time_setup: true,
			username: new_username,
			password: new_password,
		});

		const req_headers = {
			'content-type': 'application/json'
		};

		const { status, body } = await http_post(this.base_url + '/api/users', req_headers, req_body);

		if (status !== 201) {
			this._throw('First time setup failed', body);
		}
	}

	async login(username, password) {
		const req_body = JSON.stringify({ username, password });;
		const req_headers = {
			'content-type': 'application/json'
		};

		const { status, body } = await http_post(this.base_url + '/api/token', req_headers, req_body);

		if (status !== 200) {
			this._throw('Login failed', body);
		}

		const data = JSON.parse(body);
		this.#token = data.token;
		return data.payload;
	}

	async get_snowflake() {
		const { status, body } = await http_get(this.base_url + '/api/snowflake');

		if (status !== 200) {
			this._throw('Failed to acquire new snowflake ID', body);
		}

		const data = JSON.parse(body);
		return data.snowflake;
	}

	async _create_post(req_body) {
		const req_headers = {
			authorization: `Bearer ${this.#token}`,
			'content-type': 'application/json'
		};

		const { status, body } = await http_post(this.base_url + '/api/posts', req_headers, JSON.stringify(req_body));

		if (status !== 200) {
			this._throw('Failed to create new post', body);
		}

		return JSON.parse(body);
	}

	create_post(uri_name, title, subtitle, content_markdown, tags = [ ], is_draft = true) {
		return this._create_post({
			post_type: 'post',
			uri_name,
			title,
			subtitle,
			content_markdown,
			tags,
			is_draft
		});
	}

	create_comment(uri_name, external_url, content_markdown, tags = [ ], is_draft = true) {
		return this._create_post({
			post_type: 'comment',
			uri_name,
			external_url,
			content_markdown,
			tags,
			is_draft
		});
	}

	create_note(uri_name, content_markdown, tags = [ ], is_draft = true) {
		return this._create_post({
			post_type: 'note',
			uri_name,
			content_markdown,
			tags,
			is_draft
		});
	}

	create_event(uri_name, title, subtitle, content_markdown, start, end, tags = [ ], is_draft = true) {
		return this._create_post({
			post_type: 'event',
			uri_name,
			title,
			subtitle,
			content_markdown,
			date_event_start: start,
			date_event_end: end,
			tags,
			is_draft
		});
	}

	create_rsvp(uri_name, external_url, rsvp_type, content_markdown, tags = [ ], is_draft = true) {
		return this._create_post({
			post_type: 'rsvp',
			uri_name,
			external_url,
			rsvp_type,
			content_markdown,
			tags,
			is_draft
		});
	}

	// 

	_throw(message, meta) {
		const error = new Error('APIClient: ' + message);
		error.meta = meta;
		return error;
	}
}
