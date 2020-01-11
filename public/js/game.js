Vue.component('board', {
	props: [ 'columns', 'rows' ],
	template: '#board-template'
});

Vue.component('enemy-board', {
	props: [ 'columns', 'rows' ],
	template: '#enemyBoard-template'
});

new Vue({
	el: '#main_game'
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
		"<button class='ships' id='" +
			ships[i].type +
			'\' onClick=placeShip("' +
			ships[i].type +
			'")>' +
			ships[i].type +
			'</buton>'
	);
}

var size = 0;
var horizontal = true;
var placingShip = false;
var ship = '';
let placing = document.getElementById('allyside');

placing.addEventListener('mouseover', function(event) {
	if (placingShip) {
		$('.tile').mouseover(function() {
			var tileID = $(this).attr('id');
			console.log(tileID);
		});
	}
});

function placeShip(buttonID) {
	ship = ships.filter(function(ships) {
		return ships.type === buttonID;
	});

	size = ship[0].size;
	placingShip = true;
	console.log('Placing: ' + ship[0].type);
}

function tileClick(tile) {
	console.log(tile);
}

function tileEnemyClick(tile) {
	console.log('Enemy tile: ' + tile);
}

// setDef: function(el) {
// 	if(this.$root.chosenShip == null) return;
// 	var setCoordination = el.currentTarget.getAttribute('data-coordination');

// 	var size = this.$root.chosenShip.size;

// 	for (var i = 0; i < size; i++)
// 		if(this.$root.rotated) {
// 			if (parseInt(setCoordination.split("").reverse().join("")[0]) + size <= this.columns) {
// 				var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 1)) +'"]');
// 				e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
// 			}
// 			else {
// 				var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - ((i) * 1)) +'"]');
// 				e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
// 			}
// 		} else if (!this.$root.rotated) {
// 			if (document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]') != null) {
// 				var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) + (i * 10)) +'"]');
// 				e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
// 			}
// 			else {
// 				var e = document.querySelector('[data-coordination="'+ (parseInt(setCoordination) - ((size - i) * 10)) +'"]');
// 				e.className  = e.className == 'placed-tile' ? 'placed-tile' : 'tile';
// 			}
// 		}
// }
