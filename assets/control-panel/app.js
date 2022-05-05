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

	app.redirect_to('login.html');
};

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
	app.redirect_to('login.html');
};

app.http = async function http(method, path, headers = { }, body = null) {
	const url = conf.ctrl_panel_url + path;
	const res = await fetch(url, {
		method,
		mode: 'same-origin',
		headers,
		body
	});

	return res;
};

app.http_headers = function http_headers(include_auth, others) {
	return Object.assign(
		include_auth ? { authorization: `Bearer ${get_auth_token()}` } : { },
		others
	);
}



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