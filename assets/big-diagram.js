(() => {

	/*
	TODO: Finish building out zoom-in / "big mode" for diagram viewing
	*/

	const elems = document.querySelectorAll(`[class*=' rendered-'], [class^='rendered-']`);
	
	elems.forEach((elem) => {
		const button = document.createElement('button');
		button.innerHTML = 'Show Big';

		button.addEventListener('click', toggle_big);

		function show_big() {
			elem.classList.add('big');
			return false;
		}

		function hide_big() {
			elem.classList.remove('big');
			return false;
		}

		function toggle_big() {
			elem.classList.toggle('big');
			return false;
		}
	});

})();