Vue.component('board', {
	props: [ 'columns', 'rows' ],
	template: '#board-template'
});

Vue.component('enemy-board', {
	props: [ 'columns', 'rows' ],
	template: '#enemyBoard-template'
});

new Vue({
	el: '#main_game',

	data:{
		ships,
		choosenShip: null,
		statusMessage: "Waiting for the enemy...",
		enemyReady: false,
		ready: false,
		 
	}
	
});

var ships = [
	{ type: 'Carrier', size: 5, sank: false, available: 1, location: [] },
	{ type: 'Battleship', size: 4, sank: false, available: 1, location: [] },
	{ type: 'Cruiser', size: 3, sank: false, available: 1, location: [] },
	{ type: 'Submarine', size: 3, sank: false, available: 1, location: [] },
	{ type: 'Destroyer', size: 2, sank: false, available: 1, location: [] }
];

window.addEventListener('load', init);
window.addEventListener('resize', init);

function init() {
	var tds = document.getElementsByTagName('td');
	var tdWidth = tds[0].clientWidth;
	for (i = 0; i < tds.length; i++) {
		tds[i].style.height = tdWidth + 'px';
	}
}

for (i in ships) {
	$('#shipspawn').append(
		"<button class='ships' onClick=placeShip(\"" + ships[i].type + '")>' + ships[i].type + '</buton>'
	);
}

function placeShip(buttonID) {
	var ship = ships.filter(function(ships) {
		return ships.type === buttonID;
	});
	console.log(ship);
}

function tileClick(tile) {
	console.log(tile);
}

function tileEnemyClick(tile) {
	console.log('Enemy tile: ' + tile);
}

// --- Socket implementations ---
var socket = io('');

socket.on('prepareBattleship', function(){

});