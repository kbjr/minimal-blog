
import { web } from '../../http';
import { TemplateName } from '../../storage';
import { simple_template_cache } from '../../cache';

const colors_cache = simple_template_cache(TemplateName.colors_css, true);
const prism_cache = simple_template_cache(TemplateName.prism_css, true);
const styles_cache = simple_template_cache(TemplateName.styles_css);

web.get('/colors.css', async (req, res) => {
	res.type('text/css');
	return colors_cache.get_value();
});

web.get('/prism.css', async (req, res) => {
	res.type('text/css');
	return prism_cache.get_value();
});

web.get('/styles.css', async (req, res) => {
	res.type('text/css');
	return styles_cache.get_value();
});
