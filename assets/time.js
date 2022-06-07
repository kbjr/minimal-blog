(() => {
	
	const elems = document.querySelectorAll('time');
	const language = document.body.parentElement.getAttribute('lang');
	const formatter_short = Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' });
	const formatter_long = Intl.DateTimeFormat(language, { dateStyle: 'full', timeStyle: 'long' });

	elems.forEach((elem) => {
		const date = new Date(Date.parse(elem.dateTime));
		elem.title = formatter_long.format(date);
		elem.innerHTML = formatter_short.format(date);
	});

})();