(() => {
	
	const elems = document.querySelectorAll('time');
	const language = document.body.parentElement.getAttribute('lang');
	const formatter = Intl.DateTimeFormat(language, { dateStyle: 'full', timeStyle: 'long' });

	elems.forEach((elem) => {
		const date = new Date(Date.parse(elem.dateTime));
		elem.innerHTML = formatter.format(date);
	});

})();