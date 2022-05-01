
import { web } from '../../http';
import { store, TemplateName } from '../../storage';

web.get('/time.js', async (req, res) => {
	res.type('application/javascript');
	return store.templates.render(TemplateName.time_js, { });
});

web.get('/prism.js', async (req, res) => {
	res.type('application/javascript');
	return store.templates.render(TemplateName.prism_js, { });
});

web.get('/svg_icon.js', async (req, res) => {
	res.type('application/javascript');
	return store.templates.render(TemplateName.svg_icon_js, { });
});

web.get('/color_theme_toggle.js', async (req, res) => {
	res.type('application/javascript');
	return store.templates.render(TemplateName.color_theme_toggle_js, { });
});
