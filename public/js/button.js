var darkMode = false;

function modeFunction() {
	$('div.banner').toggleClass('dark-mode');
	$('div.content').toggleClass('dark-mode');
	$('td.ship-tile').toggleClass('ship-tile-dark');
	if (darkMode) {
		$('body').css({ 'background-color': '#636b6f' });
		$('td').css({ border: '1px solid black' });
	} else {
		$('body').css({ 'background-color': 'black' });
		$('td').css({ border: '1px solid white' });
	}
	darkMode = !darkMode;
}
