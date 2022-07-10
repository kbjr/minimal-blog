
import { ctrl } from '../../../http';
import { render } from './render';
import { store,assets } from '../../../storage';
import { RouteShorthandOptions } from 'fastify';
import { rendered_asset_cache } from '../../../cache';
import { TemplateContext } from '../../../storage/templates';
import { throw_404_not_found } from '../../../http-error';

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

ctrl.get('/favicon', opts, async (req, res) => {
	const body = store.settings.get('favicon');
	const type = store.settings.get('favicon_type');

	if (! body || ! type) {
		throw_404_not_found('Favicon not found');
	}

	res.type(type);
	return body;
});

ctrl.get('/time.js', opts, async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return assets.load_control_panel_asset('../time.js');
});

ctrl.get('/app.js', opts, async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return assets.load_control_panel_asset('app.js');
});

ctrl.get('/form.js', opts, async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return assets.load_control_panel_asset('form.js');
});

ctrl.get('/login_check.js', opts, async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return assets.load_control_panel_asset('login_check.js');
});

const color_theme_toggle_js = rendered_asset_cache('color_theme_toggle.js', new TemplateContext(null), { }, { });

ctrl.get('/color_theme_toggle.js', opts, async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return color_theme_toggle_js();
});

const save_indicator_js = rendered_asset_cache('save_indicator.js', new TemplateContext(null), { }, { });

ctrl.get('/save_indicator.js', opts, async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return save_indicator_js();
});

ctrl.get('/styles.css', opts, async (req, res) => {
	res.type('text/css; charset=utf-8');
	return assets.load_control_panel_asset('styles.css');
});
