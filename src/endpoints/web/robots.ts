
import { web } from '../../http';
import { store, TemplateName } from '../../storage';

web.get('/robots.txt', async (req, res) => {
	res.type('text/plain');
	return store.templates.render(TemplateName.robots_txt, { });
});
