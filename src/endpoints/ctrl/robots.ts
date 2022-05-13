
import { ctrl } from '../../http';
import { get_unrendered } from './ui/render';

ctrl.get('/robots.txt', async (req, res) => {
	res.type('text/plain');
	return get_unrendered('robots.txt');
});
