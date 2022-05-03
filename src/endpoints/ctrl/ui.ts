
import { ctrl } from '../../http';

ctrl.get('/', async (req, res) => {
	res.type('text/html');
	return '<!-- Control panel UI -->';
});
