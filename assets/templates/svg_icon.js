(() => {
	const icons = {
		// These icons are MIT licensed
		// see: https://github.com/feathericons/feather/blob/master/LICENSE
		'github': '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>',
		'linkedin': `
			<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
			<rect x="2" y="9" width="4" height="12"></rect>
			<circle cx="4" cy="4" r="2"></circle>
		`,
		'mail': `
			<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
			<polyline points="22,6 12,13 2,6"></polyline>
		`,
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
		'link': `
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
		`,
		'external-link': `
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
			<polyline points="15 3 21 3 21 9"></polyline>
			<line x1="10" y1="14" x2="21" y2="3"></line>
		`,
		'rss': `
			<path d="M4 11a9 9 0 0 1 9 9"></path>
			<path d="M4 4a16 16 0 0 1 16 16"></path>
			<circle cx="5" cy="19" r="1"></circle>
		`,
		'user': `
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
			<circle cx="12" cy="7" r="4"></circle>
		`,
		'users': `
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
			<circle cx="9" cy="7" r="4"></circle>
			<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
			<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
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

			static get icons() {
				return Object.keys(icons);
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