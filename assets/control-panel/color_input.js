(() => {

const styles = `
:host {
	display: contents;
}

.wrapper {
	width: 16rem;
	padding: 0.5rem;
	border-radius: 0.5rem;
	cursor: pointer;
	overflow: hidden;
	background: var(--theme-bg-input);
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
}

.color-swatch {
	flex: 0 0 3rem;
	width: 3rem;
	height: 3rem;
	margin: 0;
	padding: 0;
	display: block;
	content: " ";
	overflow: hidden;
	border: 0.125rem var(--theme-border-input) solid;
	border-radius: 0.5rem;
	background-size: 1rem 1rem;
	background-image: linear-gradient(45deg,
		#fff 33.33%,
		#000 33.33%,
		#000 50%,
		#fff 50%,
		#fff 83.33%,
		#000 83.33%,
		#000 100%
	);
}

.color-swatch div {
	width: 3rem;
	height: 3rem;
	margin: 0;
	padding: 0;
	display: block;
	content: " ";
}

.color-swatch input[type='color'] {
	position: relative;
	top: 3rem;
	height: 0;
	visibility: hidden;
}

.color-info {
	margin-left: 1rem;
	flex: 1 1 auto;
}

.color-name {
	font-size: 0.8rem;
	font-weight: 700;
	user-select: none;
}

.color-value {
	font-size: 0.8rem;
	/* font-weight: 700; */
	user-select: none;
}

.color-info input {
	display: block;
	margin-top: 0.1rem;
	border: 0.125rem var(--theme-border-input) solid;
	border-radius: 0.25rem;
	color: var(--theme-text-body);
	background-color: var(--theme-bg-input);
	padding: 0.1rem 0.5rem;
	font-family: var(--font-open-sans);
	font-size: 1rem;
	width: 10rem;
}

:host([show-editor]) .color-value,
:host(:not([show-editor])) .color-info input {
	display: none;
}
`;

const template = `
<style>${styles}</style>
<div class="wrapper" title="Edit Color" tabindex="0" role="button" aria-pressed="false">
	<div class="color-swatch">
		<div></div>
	</div>
	<div class="color-info">
		<label for="value" class="color-name"></label>
		<div class="color-value" aria-hidden="false"></div>
		<input type="text" id="value" aria-hidden="true">
	</div>
</div>
`;

customElements.define('color-input',
	class ColorInput extends HTMLElement {
		static get observedAttributes() {
			return [ 'disabled', 'show-editor', 'data-color' ];
		}

		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
			this.shadowRoot.innerHTML = template;

			this.wrapper = this.shadowRoot.querySelector('.wrapper');
			this.color_swatch = this.wrapper.querySelector('.color-swatch div');
			this.color_info = this.wrapper.querySelector('.color-info');
			this.color_name = this.wrapper.querySelector('.color-name');
			this.color_value = this.wrapper.querySelector('.color-value');
			this.color_input = this.wrapper.querySelector('.color-info input');
		}

		connectedCallback() {
			this.unbind_this = make_button_like(this, this.on_select);
		}
		
		disconnectedCallback() {
			this.unbind_this();
		}

		get color() {
			return this.getAttribute('data-color');
		}

		get disabled() {
			return this.getAttribute('disabled') != null;
		}

		set disabled(value) {
			if (value) {
				this.setAttribute('disabled', '');
			}

			else {
				this.removeAttribute('disabled');
			}
		}

		get show_editor() {
			return this.hasAttribute('show-editor');
		}

		set show_editor(value) {
			if (value === this.show_editor) {
				// Don't perform no-ops
				return;
			}

			if (value) {
				this.setAttribute('show-editor', '');
				this.color_input.value = this.value;
				this.color_input.focus();
				this.color_input.addEventListener('blur', this.on_input_blur);
			}

			else {
				this.removeAttribute('show-editor');
				this.color_input.value = '';

				if (document.activeElement === this) {
					this.color_input.blur();
				}

				this.color_input.removeEventListener('blur', this.on_input_blur);
			}
		}

		get value() {
			return this.wrapper.getAttribute('data-value');
		}

		set value(value) {
			if (value == null) {
				value = 'transparent';
				this.color_value.innerHTML = '<em>no value</em>';
			}

			else {
				this.color_value.innerHTML = value;
			}

			this.wrapper.setAttribute('data-value', value);
			this.color_swatch.style.background = value;
		}

		attributeChangedCallback(attr_name, old_value, new_value) {
			switch (attr_name) {
				case 'disabled':
				case 'show-editor':
					return this.update_state();
			}
		}

		update_state() {
			const { disabled, show_editor } = this;

			if (disabled || show_editor) {
				this.wrapper.removeAttribute('tabindex');
			}

			else {
				this.wrapper.setAttribute('tabindex', '0');
			}

			if (show_editor) {
				this.wrapper.setAttribute('aria-pressed', 'true');
				this.color_value.setAttribute('aria-hidden', 'true');
				this.color_input.setAttribute('aria-hidden', 'false');
			}

			else {
				this.wrapper.setAttribute('aria-pressed', 'false');
				this.color_value.setAttribute('aria-hidden', 'false');
				this.color_input.setAttribute('aria-hidden', 'true');
			}
		}

		on_select = () => {
			if (this.disabled) {
				return;
			}

			if (! this.show_editor) {
				this.show_editor = true;
			}
		};

		on_input_change = () => {
			// TODO: Show live color updates while the user is typing?
		};

		on_input_blur = () => {
			const old_value = this.value;
			const new_value = this.color_input.value;
			this.value = new_value;

			const event = new CustomEvent('change', {
				detail: { old_value, new_value }
			});

			this.dispatchEvent(event);

			this.show_editor = false;
		};
	}
);

function make_button_like(button, on_select) {
	button.addEventListener('click', on_select);
	button.addEventListener('keydown', on_keydown);
	button.addEventListener('keyup', on_keyup);

	return function unbind() {
		button.removeEventListener('click', on_selectt);
		button.removeEventListener('keydown', on_keydown);
		button.removeEventListener('keyup', on_keyup);
	}

	function on_keydown(/** @type KeyboardEvent */ event) {
		if (event.keyCode === 32) {
			event.preventDefault();
		}


		if (event.keyCode === 13) {
			event.preventDefault();
			on_select();
		}
	}

	function on_keyup(/** @type KeyboardEvent */ event) {
		if (event.keyCode === 32) {
			event.preventDefault();
			on_select();
		}
	}
}

})();