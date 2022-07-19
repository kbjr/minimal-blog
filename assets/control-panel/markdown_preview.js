(() => {

const styles = `
:host {
	display: contents;
}

ul, ol {
	padding-inline-start: 2.5rem;
}

button, pre, input, textarea, select, mark, dd {
	transition: background linear .5s;
}

h1, h2, h3, h4, h5, h6,
p, a, li, dt, dd, label,
table, td {
	font-family: var(--font-open-sans);
}

h1, h2, h3, h4, h5, h6,
th {
	color: var(--theme-text-heading);
}

code, samp, pre {
	color: var(--theme-code-normal);
	font-family: var(--font-monospace);
	font-size: 1.35rem;
}

pre {
	margin: 3rem 2rem;
	padding: 1rem 1.5rem;
	border: 0.1rem solid var(--theme-line);
	border-radius: 1rem;
	overflow: auto;
	background: var(--theme-bg-light);
}

h1 {
	font-size: 2rem;
	font-weight: 300;
}

h2 {
	font-size: 1.5rem;
	margin-block: 6rem 1rem;
}

h3 {
	font-size: 1.17rem;
	margin-block: 3rem 1rem;
}

p, small, li, dt, dd, label,
table, td {
	color: var(--theme-text-body);
}

p {
	margin: 2rem 0;
	font-size: 1.2rem;
	line-height: 1.75;
}

li {
	font-size: 1.2rem;
	margin-block: 0.5rem;
	line-height: 1.75;
}

dl {
	margin-block: 3rem;
}

dt, dd {
	margin-block: 1rem;
}

dt {
	font-weight: 700;
}

dt p {
	margin-block-end: 1rem;
}

dd {
	margin-inline-start: 1rem;
	padding-inline-start: 1rem;
	padding-block: 0.125rem;
	border-inline-start: 0.5rem var(--theme-line) solid;
	background: var(--theme-bg-heavy)
}

dd p {
	margin-block: 1rem;
}

table {
	margin-block: 2rem;
	border-collapse: collapse;
}

table, th, td {
	font-size: 1.2rem;
	line-height: 1.75;
}

tbody tr {
	border-top: 1px var(--theme-line) solid;
}

th, td {
	padding: 0.5rem;
}

td {
	font-weight: 300;
}

small {
	font-size: 0.8rem;
	font-family: var(--font-open-sans);
}

a {
	color: var(--theme-text-link);
	text-decoration: none;
}

a:active,
a:hover,
a:focus {
	color: var(--theme-text-link-active);
}

a:visited {
	color: var(--theme-text-link-visited);
}

blockquote {
	margin-block: 2rem;
	margin-inline: 1rem;
	padding-block: 0.5rem;
	padding-inline: 1.5rem;
	border-inline-start: 0.25rem var(--theme-line) solid;
}

blockquote p {
	margin: 0;
}

a.heading-anchor {
	margin-left: 0.5rem;
	display: inline-block;
}

.heading-anchor span {
	display: none;
}

.heading-anchor svg.icon {
	display: inline-block;
	color: var(--theme-text-light);
	--icon-size: 1rem;
}

.katex-display {
	color: var(--theme-text-body);
}

.katex-display .katex {
	font-size: 1.8rem;
}
	
:not(.katex-display) > .katex {
	font-size: 1.2rem;
	margin-inline: 0.5rem;
}

mark {
	color: var(--theme-text-highlight);
	background-color: var(--theme-bg-text-highlight);
	padding: 0.2rem;
}

::selection {
	fill: var(--theme-text-selection) !important;
	color: var(--theme-text-selection) !important;
	background-color: var(--theme-bg-text-selection) !important;
}

header {
	margin-bottom: 6rem;
}

header h1 {
	margin-bottom: 0;
}

header p {
	margin: 0;
}

header p.subtitle {
	margin-block: 0.5rem;
	margin-inline-start: 1.5rem;
}

header p:not(.subtitle) {
	color: var(--theme-text-light);
	font-size: 0.8rem;
	margin-inline-start: 2rem;
	margin-block-start: 0.5rem;
}

figure {
	margin-block: 2rem;
    margin-inline: 2rem;
    padding-bottom: 1.5rem;
}

figure > :not(figcaption) {
	margin-block-end: 3rem;
}

figcaption {
	color: var(--theme-text-light);
	font-family: var(--font-open-sans);
	text-align: center;
	font-size: 1rem;
	margin-block-start: -1.5rem;
}


/* ===== Rendered Blocks ===== */

/* === General === */

:is(.rendered-pikchr, .rendered-nomnoml, .rendered-bytefield, .rendered-katex, .rendered-railroad) {
	margin-block: 2rem;
}

:is(.rendered-pikchr, .rendered-nomnoml, .rendered-bytefield, .rendered-katex, .rendered-railroad) svg {
	display: block;
	margin-inline: auto;
}

:is(.rendered-pikchr, .rendered-nomnoml, .rendered-bytefield, .rendered-katex, .rendered-railroad)[data-flags~='small'] svg {
	max-width: 30rem;
	max-height: 20rem;
}

:is(.rendered-pikchr, .rendered-nomnoml, .rendered-bytefield, .rendered-katex, .rendered-railroad)[data-flags~='medium'] svg {
	max-width: 40rem;
	max-height: 40rem;
}

:is(.rendered-pikchr, .rendered-nomnoml, .rendered-bytefield, .rendered-katex, .rendered-railroad)[data-flags~='large'] svg {
	max-width: 60rem;
	max-height: 60rem;
}

:is(.rendered-pikchr, .rendered-nomnoml, .rendered-bytefield) svg text {
	fill: var(--theme-text-body);
}

/* :is(.rendered-pikchr, .rendered-nomnoml, .rendered-bytefield) svg text:not([font-family~='Times']):not([font-family~='Courier']) { */
:is(.rendered-pikchr, .rendered-nomnoml, .rendered-bytefield) svg text:not([font-family~='Courier']) {
	font-family: var(--font-open-sans);
}

/* === KaTeX === */

.katex-display {
	color: var(--theme-text-body);
}

.katex-display .katex {
	font-size: 1.8rem;
}

:not(.katex-display) > .katex {
	font-size: inherit;
	margin-inline: 0.5rem;
}

.katex span[style~='color:transparent;'] {
	user-select: none;
}

/* === nomnoml === */

.rendered-nomnoml svg g[fill='#eee8d5'] {
	fill: var(--theme-bg-light);
	transition: fill linear .5s;
}

.rendered-nomnoml svg g[stroke='#33322E'] {
	stroke: var(--theme-text-body);
}

.rendered-nomnoml svg g[fill='#33322E'] {
	fill: var(--theme-text-body);
	transition: fill linear .5s;
}

.rendered-nomnoml svg g[fill='#fdf6e3'] {
	fill: var(--theme-bg-heavy);
	transition: fill linear .5s;
}

.rendered-nomnoml svg g[font-family='monospace'] text {
	font-family: var(--font-monospace);
}

.rendered-nomnoml svg g[font-family='cursive'] text {
	font-family: var(--font-cursive);
}

/* === Pikchr */

/* boxes */
.rendered-pikchr svg path[style*='fill:none;'] {
	fill: var(--theme-bg-light) !important;
	transition: fill linear .5s;
}

/* lines and boxes */
.rendered-pikchr svg path[style*='stroke:rgb(0,0,0);'] {
	stroke: var(--theme-text-body) !important;
}

/* circles */
.rendered-pikchr svg circle[style*='stroke:rgb(0,0,0);'] {
	stroke: var(--theme-text-body) !important;
}

/* arrow heads */
.rendered-pikchr svg polygon[style='fill:rgb(0,0,0)'] {
	fill: var(--theme-text-body) !important;
	transition: fill linear .5s;
}

/* === Bytefield === */

.rendered-bytefield svg text[font-family~='Courier'] {
	font-family: var(--font-monospace);
}

.rendered-bytefield svg line[stroke='#000000'] {
	stroke: var(--theme-text-body);
}

.rendered-bytefield svg line[stroke-width='1'] {
	stroke-width: 1.5;
}

.rendered-bytefield svg line[stroke-darharray='1,1'] {
	stroke-dasharray: 1.5, 1.5;
}

/* === Railroad === */

.rendered-railroad svg {
	/* background-color: hsl(30,20%,95%); */
}

.rendered-railroad svg path {
	stroke-width: 3;
	stroke: var(--theme-text-body);
	fill: none;
}

.rendered-railroad svg text {
	font: bold 0.8rem var(--font-cursive);
	text-anchor: middle;
	white-space: pre;
	fill: var(--theme-text-body);
	font-weight: 300;
}

.rendered-railroad svg text.diagram-text {
	font-size: 0.75rem;
}

.rendered-railroad svg text.diagram-arrow {
	font-size: 1rem;
}

.rendered-railroad svg text.label {
	text-anchor: start;
}

.rendered-railroad svg text.comment {
	font: italic 0.75rem var(--font-cursive);
}

.rendered-railroad svg g.non-terminal text {
	/*font-style: italic;*/
}

.rendered-railroad svg rect {
	stroke-width: 3;
	stroke: var(--theme-text-body);
	fill: var(--theme-bg-light);
	transition: fill linear .5s;
}

.rendered-railroad svg rect.group-box {
	stroke: var(--theme-line);
	stroke-dasharray: 10 5;
	fill: none;
}

.rendered-railroad svg path.diagram-text {
	stroke-width: 3;
	stroke: var(--theme-text-body);
	fill: var(--theme-bg-main);
	cursor: help;
}

.rendered-railroad svg g.diagram-text:hover path.diagram-text {
	fill: var(--theme-bg-heavy);
}

`;

const template = `
<style>${styles}</style>
<link rel="stylesheet" href="{{{ site.url }}}/prism.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.3/dist/katex.min.css">
<article class="h-entry">
	<p>{{ labels.loading }}</p>
</article>
`;

customElements.define('markdown-preview',
	class MarkdownPreview extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
			this.shadowRoot.innerHTML = template;
			this.article = this.shadowRoot.querySelector('article');
		}

		get markdown_src() {
			return document.querySelector('#' + this.getAttribute('markdown-src'));
		}

		get external_url_src() {
			return document.querySelector('#' + this.getAttribute('external-url-src'));
		}

		async render() {
			this.article.innerHTML = '<p>{{ labels.loading }}</p>';

			const markdown = this.markdown_src.value;

			// todo: use external url to get info about external page (if relavent)

			try {
				const html = await render_markdown(markdown);
				this.article.innerHTML = `<main class="e-content">${html}</main>`;
			}

			catch (error) {
				console.error('failed to render preview', error);
				this.article.innerHTML = '<p>Failed to render preview</p>';
			}
		}
	}
);

/**
 * @param {string} markdown
 * @returns {Promise<string>}
 */
 async function render_markdown(markdown) {
	const headers = app.http_headers(true, {
		'content-type': 'text/markdown'
	});

	const res = await app.http('POST', '/api/preview-markdown', headers, markdown);
	
	switch (res.status) {
		case 200: return res.text();
		case 401: return app.redirect_to_login(true);
		default: return app.throw_http_error(res);
	}
}

})();