
import { ctrl } from '../../../http';
import { render } from './render';
import { store,assets } from '../../../storage';

let colors_css: string;

ctrl.get('/colors.css', async (req, res) => {
	res.type('text/css');

	if (! colors_css) {
		colors_css = await render('../colors.css', {
			colors: {
				light: store.colors.default_light,
				dark: store.colors.default_dark,
			}
		});
	}

	return colors_css;
});

ctrl.get('/time.js', async (req, res) => {
	res.type('application/javascript');
	return assets.load_control_panel_asset('../time.js');
});

ctrl.get('/app.js', async (req, res) => {
	res.type('application/javascript');
	return assets.load_control_panel_asset('app.js');
});

ctrl.get('/login_check.js', async (req, res) => {
	res.type('application/javascript');
	return assets.load_control_panel_asset('login_check.js');
});

ctrl.get('/color_theme_toggle.js', async (req, res) => {
	res.type('application/javascript');
	return assets.load_control_panel_asset('../color_theme_toggle.js');
});

ctrl.get('/svg_icon.js', async (req, res) => {
	res.type('application/javascript');
	return assets.load_control_panel_asset('svg_icon.js');
});

ctrl.get('/styles.css', async (req, res) => {
	res.type('text/css');
	return assets.load_control_panel_asset('styles.css');
});
