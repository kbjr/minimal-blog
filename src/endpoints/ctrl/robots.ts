
import { ctrl } from '../../http';
import { assets } from '../../storage';

ctrl.get('/robots.txt', async (req, res) => {
	res.type('text/plain');
	return assets.load_control_panel_asset('robots.txt');
});
