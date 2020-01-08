var darkMode = false;

function modeFunction() {
	$('div.banner').toggleClass('dark-mode');
	$('div.content').toggleClass('dark-mode');
	if (darkMode) 
	$('body').css({ 'background-color': '#636b6f' });
	else 
	$('body').css({ 'background-color': '#f5f5f7' });

	darkMode = !darkMode;
}
