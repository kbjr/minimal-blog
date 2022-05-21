
import { marked } from 'marked';

export const renderer = new marked.Renderer();

renderer.heading = function(text, level, raw, slugger) {
	const id = slugger.slug(raw);
	
	return `
		<h${level} id="${id}">
			${text}
			<a class="heading-anchor" href="#${id}">
				<svg-icon icon="link" aria-hidden="true"></svg-icon>
				<span style="display: none">Section titled ${text}</span>
			</a>
		</h${level}>
	`;
};
