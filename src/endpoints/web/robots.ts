
import { web } from '../../http';
import { TemplateName } from '../../storage';
import { simple_template_cache } from '../../cache';

const robots_cache = simple_template_cache(TemplateName.robots_txt);

web.get('/robots.txt', async (req, res) => {
	res.type('text/plain');
	return robots_cache.get_value();
});
