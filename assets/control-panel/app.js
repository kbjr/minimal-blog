(() => {

const app = window.app = { };

app.redirect_to = function redirect_to(path) {
	console.log(`redirect_to: ${path}`);
	window.location = `${conf.ctrl_panel_url}/${path}`;
}

app.redirect_to_login = function redirect_to_login(redirect_back = false) {
	if (redirect_back) {
		let current = window.location.href;

		if (current.startsWith(conf.ctrl_panel_url)) {
			current = current.slice(conf.ctrl_panel_url.length);
			
			if (current[0] === '/') {
				current = current.slice(1);
			}

			set_post_login_redirect(current);
		}
	}

	app.redirect_to('login');
};

app.replace_url = function replace_url(new_uri) {
	const new_url = `${conf.ctrl_panel_url}/${path}`;
	history.replaceState({ }, '', new_url);
}

app.login = function login(token, payload, redirect = false) {
	set_auth_token(token);
	conf.token_payload = payload;

	if (redirect) {
		const post_login = get_post_login_redirect();
	
		if (post_login) {
			clear_post_login_redirect();
			app.redirect_to(post_login);
		}
	
		else {
			app.redirect_to('');
		}
	}
};

app.logout = function logout() {
	clear_auth_token();
	app.redirect_to('login');
};

app.get_snowflake = async function get_snowflake() {
	return (await app.http_get('/api/snowflake')).snowflake;
};

app.http = async function http(method, path, headers = { }, body = null) {
	return fetch(conf.ctrl_panel_url + path, {
		method,
		mode: 'same-origin',
		headers,
		body
	});
};

app.http_get = async function http_get(path, include_auth = false) {
	const res = await app.http('GET', path, app.http_headers(include_auth));
	
	switch (res.status) {
		case 200: {
			return res.json();
		};

		case 401: {
			app.redirect_to_login(true);
			break;
		};

		case 403:
		case 500:
		default:
			return app.throw_http_error(res);
	}
};

app.http_post = async function http_post(path, include_auth = false, body = null) {
	const headers = app.http_headers(include_auth, body == null ? null : {
		'content-type': 'application/json'
	});

	const res = await app.http('POST', path, headers, body == null ? null : JSON.stringify(body));
	
	switch (res.status) {
		case 201: return res.json();
		case 401: return app.redirect_to_login(true);

		case 403:
		case 422:
		case 500:
		default:
			return app.throw_http_error(res);
	}
};

app.http_patch = async function http_patch(path, include_auth = false, body = null) {
	const headers = app.http_headers(include_auth, body == null ? null : {
		'content-type': 'application/json'
	});

	const res = await app.http('PATCH', path, headers, body == null ? null : JSON.stringify(body));
	
	switch (res.status) {
		case 204: return;
		case 200: return res.json();
		case 401: return app.redirect_to_login(true);

		case 403:
		case 422:
		case 500:
		default:
			return app.throw_http_error(res);
	}
};

app.http_headers = function http_headers(include_auth, others) {
	return Object.assign(
		include_auth ? { authorization: `Bearer ${get_auth_token()}` } : { },
		others
	);
};

app.throw_http_error = async function http_error(res) {
	let body;

	if (res.headers.get('content-type') === 'application/json') {
		try {
			body = await res.json();
		}

		catch (error) {
			console.error(error);
			body = await res.text();
		}

		throw new app.HttpError(res, body);
	}

	throw new app.HttpError(res, await res.text());
};

app.HttpError = class HttpError {
	constructor(res, body) {
		this.res = res;
		this.body = body;
		console.error('HTTP Error', res.status, body);
	}
};



// ===== Local Storage =====

// Auth Token

function get_auth_token() {
	return localStorage.getItem('auth_token');
}

function set_auth_token(token) {
	return localStorage.setItem('auth_token', token);
}

function clear_auth_token() {
	return localStorage.removeItem('auth_token');
}

// Post-Login Redirect

function get_post_login_redirect() {
	return localStorage.getItem('post_login_redirect');
}

function set_post_login_redirect(token) {
	return localStorage.setItem('post_login_redirect', token);
}

function clear_post_login_redirect() {
	return localStorage.removeItem('post_login_redirect');
}

})();