
import { ctrl } from '../../../http';
import { store } from '../../../storage';
import { get_unrendered, render } from './render';

let colors_css: string;

ctrl.get('/colors.css', async (req, res) => {
	res.type('text/css');

	if (! colors_css) {
		colors_css = await render('../colors.css', {
			colors: {
				light: store.color_themes.default_light,
				dark: store.color_themes.default_dark,
			}
		});
	}

	return colors_css;
});

ctrl.get('/time.js', async (req, res) => {
	res.type('application/javascript');
	return get_unrendered('../time.js');
});

ctrl.get('/app.js', async (req, res) => {
	res.type('application/javascript');
	return get_unrendered('app.js');
});

ctrl.get('/login_check.js', async (req, res) => {
	res.type('application/javascript');
	return get_unrendered('login_check.js');
});

ctrl.get('/color_theme_toggle.js', async (req, res) => {
	res.type('application/javascript');
	return get_unrendered('../color_theme_toggle.js');
});

ctrl.get('/svg_icon.js', async (req, res) => {
	res.type('application/javascript');
	return get_unrendered('svg_icon.js');
});

ctrl.get('/styles.css', async (req, res) => {
	res.type('text/css');
	return get_unrendered('styles.css');
});
