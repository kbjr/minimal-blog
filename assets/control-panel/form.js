(() => {

app.Form = class Form {
	#form_elem = null;
	#input_elems = null;
	#button_elems = null;
	#submit_elem = null;
	#submit_callback = null;
	#reset_callback = null;

	constructor(form_elem, submit, reset) {
		this.#form_elem = form_elem;
		this.#submit_callback = submit;
		this.#reset_callback = reset;

		this.#input_elems = form_elem.querySelectorAll('input, textarea, select');
		this.#button_elems = form_elem.querySelectorAll('button');
		this.#submit_elem = form_elem.querySelector('button[type="submit"]');

		this.#form_elem.addEventListener('submit', this.on_submit);
		this.#form_elem.addEventListener('reset', this.on_reset);

		for (const input of this.#input_elems) {
			input.addEventListener('change', this.on_input_change);
		}
	}

	on_submit = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();
		this.submit();
		return false;
	};

	on_reset = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();
		this.reset();
		return false;
	};

	async submit() {
		if (this.#submit_callback) {
			this.disable();

			try {
				// todo: show thinking
				await this.#submit_callback();
				// todo: show success
			}

			catch (error) {
				// todo: show failure
			}

			finally {
				this.enable(false);
			}
		}
	}

	async reset() {
		if (this.#reset_callback) {
			this.#reset_callback();
		}
	}

	on_input_change = (event) => {
		this.#submit_elem.disabled = false;
	};

	disable() {
		for (const input of this.#input_elems) {
			input.disabled = true;
		}

		for (const button of this.#button_elems) {
			button.disabled = true;
		}
	}

	enable(include_buttons = false) {
		for (const input of this.#input_elems) {
			input.disabled = false;
		}

		if (include_buttons) {
			for (const button of this.#button_elems) {
				button.disabled = false;
			}
		}
	}
};

})();