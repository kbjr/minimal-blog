(() => {

const token = localStorage.getItem('auth_token');

if (! token) {
	return app.redirect_to_login(true);
}

try {
	const payload_base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
	const payload_json = decodeURIComponent(
		atob(payload_base64)
			.split('')
			.map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
			.join('')
	);

	const payload = JSON.parse(payload_json);

	if (payload) {
		const now = Date.now();
		const exp = payload.exp * 1000;

		// TODO: Add a check here to refresh token if near expiring?

		if (exp < now) {
			app.redirect_to_login(true);
		}
	}

	conf.token_payload = payload;
}

catch (error) {
	console.error(error);
	app.redirect_to_login(true);
}

})();