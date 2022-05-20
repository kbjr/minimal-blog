
import { web } from '../../http';
import { FastifyRequest } from 'fastify';
import { throw_404_not_found } from '../../http-error';
import { load_asset, load_katex_asset } from '../../storage/assets';
import { store } from '../../storage';
import { rendered_asset_cache, rendered_template_cache } from '../../cache';
import { TemplateContext } from '../../storage/templates';

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

// ===== Robots =====

const robots_txt = rendered_template_cache('robots.txt', new TemplateContext(null), { }, {
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

const svg_icon_js = rendered_template_cache('svg_icon.js', new TemplateContext(null), { }, {
	settings: true,
	colors: true,
	templates: true
});

web.get('/svg_icon.js', async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return svg_icon_js();
});

web.get('/color_theme_toggle.js', async (req, res) => {
	res.type('application/javascript; charset=utf-8');
	return load_asset('color_theme_toggle.js');
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

const styles_css = rendered_template_cache('styles.css', new TemplateContext(null), { }, {
	settings: true,
	colors: true,
	templates: true
});

web.get('/styles.css', async (req, res) => {
	res.type('text/css; charset=utf-8');
	return styles_css();
});

// ===== KaTeX Assets =====

web.get('/katex/katex.css', async (req, res) => {
	res.type('text/css; charset=utf-8');
	return load_katex_asset('katex.min.css');
});

type FontReq = FastifyRequest<{
	Params: { file: string };
}>;

web.get('/katex/fonts/:file', async (req: FontReq, res) => {
	const { file } = req.params;

	if (! font_files.has(file)) {
		throw_404_not_found('not found');
	}

	res.type(`font/${file.split('.').pop()}`);
	return load_katex_asset('fonts/' + file);
});

const font_files = new Set([
	'KaTeX_AMS-Regular.woff2',
	'KaTeX_AMS-Regular.woff',
	'KaTeX_AMS-Regular.ttf',
	'KaTeX_Caligraphic-Bold.woff2',
	'KaTeX_Caligraphic-Bold.woff',
	'KaTeX_Caligraphic-Bold.ttf',
	'KaTeX_Caligraphic-Regular.woff2',
	'KaTeX_Caligraphic-Regular.woff',
	'KaTeX_Caligraphic-Regular.ttf',
	'KaTeX_Fraktur-Bold.woff2',
	'KaTeX_Fraktur-Bold.woff',
	'KaTeX_Fraktur-Bold.ttf',
	'KaTeX_Fraktur-Regular.woff2',
	'KaTeX_Fraktur-Regular.woff',
	'KaTeX_Fraktur-Regular.ttf',
	'KaTeX_Main-Bold.woff2',
	'KaTeX_Main-Bold.woff',
	'KaTeX_Main-Bold.ttf',
	'KaTeX_Main-BoldItalic.woff2',
	'KaTeX_Main-BoldItalic.woff',
	'KaTeX_Main-BoldItalic.ttf',
	'KaTeX_Main-Italic.woff2',
	'KaTeX_Main-Italic.woff',
	'KaTeX_Main-Italic.ttf',
	'KaTeX_Main-Regular.woff2',
	'KaTeX_Main-Regular.woff',
	'KaTeX_Main-Regular.ttf',
	'KaTeX_Math-BoldItalic.woff2',
	'KaTeX_Math-BoldItalic.woff',
	'KaTeX_Math-BoldItalic.ttf',
	'KaTeX_Math-Italic.woff2',
	'KaTeX_Math-Italic.woff',
	'KaTeX_Math-Italic.ttf',
	'KaTeX_SansSerif-Bold.woff2',
	'KaTeX_SansSerif-Bold.woff',
	'KaTeX_SansSerif-Bold.ttf',
	'KaTeX_SansSerif-Italic.woff2',
	'KaTeX_SansSerif-Italic.woff',
	'KaTeX_SansSerif-Italic.ttf',
	'KaTeX_SansSerif-Regular.woff2',
	'KaTeX_SansSerif-Regular.woff',
	'KaTeX_SansSerif-Regular.ttf',
	'KaTeX_Script-Regular.woff2',
	'KaTeX_Script-Regular.woff',
	'KaTeX_Script-Regular.ttf',
	'KaTeX_Size1-Regular.woff2',
	'KaTeX_Size1-Regular.woff',
	'KaTeX_Size1-Regular.ttf',
	'KaTeX_Size2-Regular.woff2',
	'KaTeX_Size2-Regular.woff',
	'KaTeX_Size2-Regular.ttf',
	'KaTeX_Size3-Regular.woff2',
	'KaTeX_Size3-Regular.woff',
	'KaTeX_Size3-Regular.ttf',
	'KaTeX_Size4-Regular.woff2',
	'KaTeX_Size4-Regular.woff',
	'KaTeX_Size4-Regular.ttf',
	'KaTeX_Typewriter-Regular.woff2',
	'KaTeX_Typewriter-Regular.woff',
	'KaTeX_Typewriter-Regular.ttf',
]);
