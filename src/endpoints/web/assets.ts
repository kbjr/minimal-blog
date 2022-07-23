
import { web } from '../../http';
import { store } from '../../storage';
import { load_asset } from '../../storage/assets';
import { TemplateContext } from '../../storage/templates';
import { rendered_asset_cache, rendered_template_cache } from '../../cache';

const colors_context = Object.freeze({
	colors: Object.freeze({
		get light() {
			return store.colors.get_light();
		},
		get dark() {
			return store.colors.get_dark();
		}
	})
});

const null_context = async () => new TemplateContext(null);

// ===== Robots =====

const robots_txt = rendered_template_cache('robots.txt', null_context, { }, {
	settings: true,
	colors: true,
	templates: false
});

web.get('/robots.txt', async (req, res) => {
	res.type('text/plain; charset=utf-8');
	return robots_txt();
});

// ===== JS Assets =====

web.get('/time.js', async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return load_asset('time.js');
});

const color_theme_toggle_js = rendered_asset_cache('color_theme_toggle.js', new TemplateContext(null), { }, { });

web.get('/color_theme_toggle.js', async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return color_theme_toggle_js();
});

// ===== CSS Assets =====

web.get('/prism.css', async (req, res) => {
	res.type('text/css; charset=utf-8');
	return load_asset('prism.css');
});

const colors_css = rendered_asset_cache('colors.css', colors_context, { }, {
	settings: true,
	colors: true,
	templates: false
});

web.get('/colors.css', async (req, res) => {
	res.type('text/css; charset=utf-8');
	return colors_css();
});

css_template('base.css');
css_template('pages.css');

function css_template(file: string) {
	const rendered = rendered_template_cache(file, null_context, { }, {
		settings: true,
		colors: true,
		templates: true
	});

	web.get(`/${file}`, async (req, res) => {
		res.type('text/css; charset=utf-8');
		return rendered();
	});
}
