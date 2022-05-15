(() => {
	const icons = {
		'moon': '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
		'sun': `
			<circle cx="12" cy="12" r="5"></circle>
			<line x1="12" y1="1" x2="12" y2="3"></line>
			<line x1="12" y1="21" x2="12" y2="23"></line>
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
			<line x1="1" y1="12" x2="3" y2="12"></line>
			<line x1="21" y1="12" x2="23" y2="12"></line>
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
		`,
		'sliders': `
			<line x1="4" y1="21" x2="4" y2="14"></line>
			<line x1="4" y1="10" x2="4" y2="3"></line>
			<line x1="12" y1="21" x2="12" y2="12"></line>
			<line x1="12" y1="8" x2="12" y2="3"></line>
			<line x1="20" y1="21" x2="20" y2="16"></line>
			<line x1="20" y1="12" x2="20" y2="3"></line>
			<line x1="1" y1="14" x2="7" y2="14"></line>
			<line x1="9" y1="8" x2="15" y2="8"></line>
			<line x1="17" y1="16" x2="23" y2="16"></line>
		`,
		'alert-triangle': `
			<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
			<line x1="12" y1="9" x2="12" y2="13"></line>
			<line x1="12" y1="17" x2="12.01" y2="17"></line>
		`,
		'code': `
			<polyline points="16 18 22 12 16 6"></polyline>
			<polyline points="8 6 2 12 8 18"></polyline>
		`,
		'hash': `
			<line x1="4" y1="9" x2="20" y2="9"></line>
			<line x1="4" y1="15" x2="20" y2="15"></line>
			<line x1="10" y1="3" x2="8" y2="21"></line>
			<line x1="16" y1="3" x2="14" y2="21"></line>
		`,
		'message-square': `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>`,
		'pen-tool': `
			<path d="M12 19l7-7 3 3-7 7-3-3z"></path>
			<path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
			<path d="M2 2l7.586 7.586"></path>
			<circle cx="11" cy="11" r="2"></circle>
		`,
		'share': `
			<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
			<polyline points="16 6 12 2 8 6"></polyline>
			<line x1="12" y1="2" x2="12" y2="15"></line>
		`,
		'tag': `
			<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
			<line x1="7" y1="7" x2="7.01" y2="7"></line>
		`,
		'tool': `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>`,
		'trash': `
			<polyline points="3 6 5 6 21 6"></polyline>
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
			<line x1="10" y1="11" x2="10" y2="17"></line>
			<line x1="14" y1="11" x2="14" y2="17"></line>		
		`,
		'link': `
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
		`,
		'external-link': `
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
			<polyline points="15 3 21 3 21 9"></polyline>
			<line x1="10" y1="14" x2="21" y2="3"></line>
		`,
		'arrow-left': `
			<line x1="19" y1="12" x2="5" y2="12"></line>
			<polyline points="12 19 5 12 12 5"></polyline>
		`,
		'arrow-right': `
			<line x1="5" y1="12" x2="19" y2="12"></line>
			<polyline points="12 5 19 12 12 19"></polyline>
		`,
	};

	const template = `
		<style>
			svg {
				width: var(--icon-size, 2.5rem);
				height: var(--icon-size, 2.5rem);
				display: block;
			}
		</style>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		></svg>
	`;

	customElements.define('svg-icon',
		class Icon extends HTMLElement {
			static get observedAttributes() {
				return [ 'icon' ];
			}
	
			constructor() {
				super();
				this.attachShadow({ mode: 'open' });
	
				this.shadowRoot.innerHTML = template;
				this.svg = this.shadowRoot.querySelector('svg');

				this.update_icon();
			}

			get icon() {
				return this.getAttribute('icon');
			}
	
			attributeChangedCallback(attr, old_value, new_value) {
				if (attr === 'icon' && old_value !== new_value) {
					this.update_icon();
				}
			}

			update_icon() {
				this.svg.innerHTML = icons[this.icon] || '';
			}
		}
	);
})();