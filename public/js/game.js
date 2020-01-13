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

	data: {
		ships,
		choosenShip: null,
		statusMessage: 'Waiting for the enemy...',
		opponentReady: false,
		ready: false,
		canFire: false
	}
});

//----POST VUE!-----

//------ Variables ------
var ships = [
	{ type: 'Carrier', size: 5, sank: false, available: 1, location: [] },
	{ type: 'Battleship', size: 4, sank: false, available: 1, location: [] },
	{ type: 'Cruiser', size: 3, sank: false, available: 1, location: [] },
	{ type: 'Submarine', size: 3, sank: false, available: 1, location: [] },
	{ type: 'Destroyer', size: 2, sank: false, available: 1, location: [] }
];

var size = 0;
var horizontal = true;
var placingShip = false;
var ship = '';
var shipsToPlace = ships.length;
var readyToPlay = false;
var player = $('#sessionID').val();
var socket = io();
var hits = 0; //17hits
var room;

//------ General functions ------
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
		"<button class='ships' id='" +
			ships[i].type +
			'\' onClick=placeShip("' +
			ships[i].type +
			'")>' +
			ships[i].type +
			'</buton>'
	);
}


function paintHorizontal(tileID, color) {
	for (i = 1; i < ship.size; i++) {
		if ((tileID + i) % 10 < 9) {
			var id = '#' + (tileID + i).toString();
			$(id).css({ 'background-color': color });
			//console.log('#' + (tileID + i).toString());
		} else break;
	}
}

function paintVertical(tileID, color) {
	for (i = 1; i < ship.size; i++) {
		var id = '#' + (tileID + i * 10).toString();
		$(id).css({ 'background-color': color });
	}
}

$('#allyside').hover(function() {
	$('.tile').mouseover(function() {
		if (placingShip) {
			var tileID = parseInt($(this).attr('id'), 10);
			if (horizontal) paintHorizontal(tileID, '#bdbdbd');
			else paintVertical(tileID, '#bdbdbd');
		}
	});
	$('.tile').mouseleave(function() {
		if (placingShip) {
			var tileID = parseInt($(this).attr('id'), 10);
			if (horizontal) paintHorizontal(tileID, '');
			else paintVertical(tileID, '');
		}
	});
	$('.tile').contextmenu(function() {
		if (placingShip) {
			var tileID = parseInt($(this).attr('id'), 10);
			if (horizontal) {
				paintHorizontal(tileID, '');
				paintVertical(tileID, '#bdbdbd');
			} else {
				paintVertical(tileID, '');
				paintHorizontal(tileID, '#bdbdbd');
			}
			horizontal = !horizontal;
		}
	});
});

function placeShip(buttonID) {
	for (i = 0; i < ships.length; i++) if (ships[i].type === buttonID) ship = ships[i];
	size = ship.size;
	placingShip = true;
	console.log('Placing: ' + ship.type);
}

function ready(tile) {
	if (horizontal) {
		for (i = 0; i < ship.size; i++) if ($('#' + (tile + i).toString()).hasClass('ship-tile')) return false;
	} else {
		for (i = 0; i < ship.size; i++) if ($('#' + (tile + i * 10).toString()).hasClass('ship-tile')) return false;
	}
	return true;
}
function tileClick(tile) {
	if (placingShip) {
		if (ready(tile)) {
			if (horizontal) {
				if ((tile + ship.size) % 10 < 10 && tile % 10 < (tile + ship.size) % 10) {
					paintHorizontal(tile, '');
					for (i = 0; i < ship.size; i++) {
						$('#' + (tile + i).toString()).addClass('ship-tile');
						ship.location.push(tile + i);
					}
					doneplacing();
				}
			} else {
				console.log(parseInt(tile / 10) * 10 + 10 * ship.size);
				if (parseInt(tile / 10) * 10 + 10 * ship.size < 100) {
					paintVertical(tile, '');
					for (i = 0; i < ship.size; i++) {
						$('#' + (tile + i * 10).toString()).addClass('ship-tile');
						ship.location.push(tile + i * 10);
					}
					doneplacing();
				}
			}
		}
	}
}

function doneplacing() {
	placingShip = false;
	if (--ship.available == 0) {
		$('#' + ship.type).attr('disabled', true);
		hits += ship.size;
	}
	if (--shipsToPlace == 0) {
		socket.emit('ready', player);
	}
	//console.log(ships);
}

function tileEnemyClick(tile) {
	if (readyToPlay) {
		var id = '#enemy_' + tile.toString();
		if ($(id).hasClass('hit-tile') || $(id).hasClass('missed-tile')) return;
		else {
			readyToPlay = false;
			socket.emit('fire', { room: room, tile: tile });
		}
	}
}

// ------ Socket Communication ------
socket.on('joined', (data) => {
	room = data.room;
	readyToPlay = data.turn;
});

socket.on('fired', function(tile) {
	readyToPlay = true;
	var id = '#' + tile.toString();
	if ($(id).hasClass('ship-tile')) {
		$(id).removeClass('ship-tile');
		$(id).addClass('hit-tile');
		socket.emit('hit', { room: room, tile: tile });
	} else {
		$(id).addClass('missed-tile');
		socket.emit('miss', { room: room, tile: tile });
	}
});

socket.on('hited', function(tile) {
	var id = '#enemy_' + tile.toString();
	$(id).addClass('hit-tile');
	hits--;
	if (hits === 0) {
		alert('Sorry, you lose!');
		socket.emit('win', { room: room, msg: 'GG!' });
	}
});

socket.on('missed', function(tile) {
	var id = '#enemy_' + tile.toString();
	$(id).addClass('missed-tile');
});

socket.on('won', (data) => alert('You win! \n' + data));
