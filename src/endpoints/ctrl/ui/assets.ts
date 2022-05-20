
import { ctrl } from '../../../http';
import { render } from './render';
import { store,assets } from '../../../storage';
import { RouteShorthandOptions } from 'fastify';

const opts: RouteShorthandOptions = {
	schema: {
		tags: ['X-HIDDEN']
	}
};

let colors_css: string;

ctrl.get('/colors.css', opts, async (req, res) => {
	res.type('text/css; charset=utf-8');

	if (! colors_css) {
		colors_css = await render('../colors.css', {
			colors: {
				get light() { return store.colors.get_default_light(); },
				get dark() { return store.colors.get_default_dark(); },
			}
		});
	}

	return colors_css;
});

ctrl.get('/time.js', opts, async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return assets.load_control_panel_asset('../time.js');
});

ctrl.get('/app.js', opts, async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return assets.load_control_panel_asset('app.js');
});

ctrl.get('/login_check.js', opts, async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return assets.load_control_panel_asset('login_check.js');
});

ctrl.get('/color_theme_toggle.js', opts, async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return assets.load_control_panel_asset('../color_theme_toggle.js');
});

ctrl.get('/svg_icon.js', opts, async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return assets.load_control_panel_asset('svg_icon.js');
});

ctrl.get('/styles.css', opts, async (req, res) => {
	res.type('text/css; charset=utf-8');
	return assets.load_control_panel_asset('styles.css');
});
