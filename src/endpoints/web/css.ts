
import { web } from '../../http';
import { store, TemplateName } from '../../storage';

web.get('/colors.css', async (req, res) => {
	res.type('text/css');
	return store.templates.render(TemplateName.colors_css, { });
});

web.get('/prism.css', async (req, res) => {
	res.type('text/css');
	return store.templates.render(TemplateName.prism_css, { });
});

web.get('/styles.css', async (req, res) => {
	res.type('text/css');
	return store.templates.render(TemplateName.styles_css, { });
});
