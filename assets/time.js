(async () => {
	
	const elems = document.querySelectorAll('time');

	elems.forEach((elem) => {
		const date = new Date(Date.parse(elem.dateTime));
		elem.innerHTML = date.toLocaleString();
	});

})();