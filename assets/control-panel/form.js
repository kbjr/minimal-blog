(() => {

const instances = [ ];

window.onbeforeunload = (event) => {
	for (const form of instances) {
		if (form.needs_save) {
			return false;
		}
	}
};

app.FormSubmitError = class FormSubmitError {
	message = null;
	constructor(message) {
		this.message = message;
	}
};

app.Form = class Form {
	#form_elem = null;
	#input_elems = null;
	#button_elems = null;
	#submit_elem = null;
	#save_ind = null;
	#submit_callback = null;
	#reset_callback = null;

	constructor(form_elem, submit, reset) {
		instances.push(this);

		this.#form_elem = form_elem;
		this.#submit_callback = submit;
		this.#reset_callback = reset;

		this.#input_elems = form_elem.querySelectorAll('input, textarea, select, color-input');
		this.#button_elems = form_elem.querySelectorAll('button');
		this.#submit_elem = form_elem.querySelector('button[type="submit"]');
		this.#save_ind = form_elem.querySelector('save-indicator');

		this.#form_elem.addEventListener('submit', this.on_submit);
		this.#form_elem.addEventListener('reset', this.on_reset);

		for (const input of this.#input_elems) {
			input.addEventListener('change', this.on_change);
		}
	}

	get needs_save() {
		return ! this.#submit_elem.disabled;
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
				this.show_active();
				await this.#submit_callback();
				this.show_success();
				this.autohide_success();
				this.enable(false);
			}

			catch (error) {
				console.error(error);

				if (this.#save_ind) {
					if (error instanceof app.FormSubmitError) {
						this.#save_ind.show_failure(
							error.message || this.#save_ind.getAttribute('data-failure-message')
						);
					}

					else {
						this.#save_ind.show_failure(
							this.#save_ind.getAttribute('data-failure-message')
						);
					}
				}

				this.enable(true);
			}
		}
	}

	async reset() {
		if (this.#reset_callback) {
			this.#reset_callback();
		}
	}

	show_active() {
		if (this.#save_ind) {
			this.#save_ind.show_active(
				this.#save_ind.getAttribute('data-active-message')
			);
		}
	}

	show_success() {
		if (this.#save_ind) {
			this.#save_ind.show_success(
				this.#save_ind.getAttribute('data-success-message')
			);
		}
	}

	autohide_success() {
		if (this.#save_ind) {
			this.#save_ind.hide_in(5000);
		}
	}

	on_change = (event) => {
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

	enable(include_submit = false) {
		for (const input of this.#input_elems) {
			input.disabled = false;
		}

		for (const button of this.#button_elems) {
			// skip submit button unless `include_submit` is set
			if (! include_submit && button.getAttribute('type') === 'submit') {
				continue;
			}

			button.disabled = false;
		}
	}
};

})();