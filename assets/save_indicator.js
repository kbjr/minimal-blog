(() => {

const icon_active = '{{{ icons.loader }}}';
const icon_success = '{{{ icons.check }}}';
const icon_failure = '{{{ icons.x }}}';

const styles = `
:host {
	display: block;
}

.wrapper {
	display: flex;
	flex-direction: row;
	align-items: center;
	opacity: 0;
	transition: opacity linear .2s;
}

.wrapper[data-state] {
	opacity: 1;
}

.icon {
	width: 1.5rem;
	height: 1.5rem;
	--icon-size: 1.5rem;
}

.message {
	font-size: 0.8rem;
	font-weight: 700;
	font-family: var(--font-open-sans);
	margin-block: 0;
	margin-inline-start: 0.5rem;
	color: var(--theme-text-light);
}

.wrapper[data-state='active'] .icon {
	color: var(--theme-icon-active-indicator);
	animation: spin-animation 5s infinite;
	animation-timing-function: linear;
}

@keyframes spin-animation {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

.wrapper[data-state='success'] .icon {
	color: var(--theme-icon-success-indicator);
}

.wrapper[data-state='failure'] .icon {
	color: var(--theme-icon-failure-indicator);
}
`;

const template = `
<style>${styles}</style>
<div class="wrapper">
	<div class="icon"></div>
	<p class="message"></p>
</div>
`;

customElements.define('save-indicator',
	class SaveIndicator extends HTMLElement {
		#wrapper = null;
		#icon = null;
		#message = null;
		#hide_timer = null;
		
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
			this.shadowRoot.innerHTML = template;
			this.#wrapper = this.shadowRoot.querySelector('.wrapper');
			this.#icon = this.shadowRoot.querySelector('.icon');
			this.#message = this.shadowRoot.querySelector('.message');
		}

		show_active(message = '') {
			this.clear_hide();
			this.#icon.innerHTML = icon_active;
			this.#message.innerHTML = message;
			this.#wrapper.removeAttribute('aria-hidden');
			this.#wrapper.setAttribute('data-state', 'active');
		}

		show_success(message = '') {
			this.clear_hide();
			this.#icon.innerHTML = icon_success;
			this.#message.innerHTML = message;
			this.#wrapper.removeAttribute('aria-hidden');
			this.#wrapper.setAttribute('data-state', 'success');
		}

		show_failure(message = '') {
			this.clear_hide();
			this.#icon.innerHTML = icon_failure;
			this.#message.innerHTML = message;
			this.#wrapper.removeAttribute('aria-hidden');
			this.#wrapper.setAttribute('data-state', 'failure');
		}

		hide() {
			this.clear_hide();
			this.#wrapper.setAttribute('aria-hidden', 'true');
			this.#wrapper.removeAttribute('data-state');
		}

		clear_hide() {
			if (this.#hide_timer) {
				clearTimeout(this.#hide_timer);
				this.#hide_timer = null;
			}
		}

		hide_in(ms) {
			this.clear_hide();
			this.#hide_timer = setTimeout(() => this.hide(), ms);
		}
	}
);

})();