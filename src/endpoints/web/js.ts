
import { web } from '../../http';
import { TemplateName } from '../../storage';
import { simple_template_cache } from '../../cache';

const time_cache = simple_template_cache(TemplateName.time_js, true);
const svg_icon_cache = simple_template_cache(TemplateName.svg_icon_js, true);
const color_theme_toggle_cache = simple_template_cache(TemplateName.color_theme_toggle_js, true);

web.get('/time.js', async (req, res) => {
	res.type('application/javascript');
	return time_cache.get_value();
});

web.get('/svg_icon.js', async (req, res) => {
	res.type('application/javascript');
	return svg_icon_cache.get_value();
});

web.get('/color_theme_toggle.js', async (req, res) => {
	res.type('application/javascript');
	return color_theme_toggle_cache.get_value();
});
