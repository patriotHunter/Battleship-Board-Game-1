// ------ Configs ------
const PORT = 8080;
const HOST = 'localhost';
const DB_USER = 'root';
const DB_PASSWORD = '';
const DB_PORT = 3306;
const DB_NAME = 'battleship';
const KEY = 'express.sid';
const SECRET = 'express';

// ------ Variables ------
// --- Default Variables ---
var sessionFormat = {
	secret: 'radio silence',
	saveUninitialized: true,
	resave: true,
	isLogged: false,
	username: '',
	email: '',
	cookie: { maxAge: 18000000 } //1/2 hour in ms
};

var players = [];
var turns = 0;

// --- Variables for Socket Handling ---
var updateShip = function(id, ship) {
	var player;
	console.log('Ship', ship);

	for (var i = 0; i < players.length; i++) {
		if (players[i].id == id) player = players[i];
	}

	for (var i = 0; i < ships.length; i++) {
		if (ships[i].type == ship.type) {
			player.ships.push(ship);
		}
	}
	console.log('Player', player.id, 'Ship', ship, 'Ships', player.ships);
};

var permissionToFire = function(id, callback) {
	players.map(function(enemy) {
		if (enemy.id == id) callback((enemy.permissionToFire = true));
	});
};

// ------ Dependencies ------
const express = require('express');
const http = require('http');
const ejs = require('ejs');
const socketio = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketio(server);
const mysql = require('mysql');
const crypt = require('crypto-js/sha256');
const parser = require('body-parser');
const cookie = require('cookie-parser');
const sharedsession = require('express-socket.io-session');
const session = require('express-session');
// const session = require('express-session')({
// 	secret: 'radio silence',
// 	saveUninitialized: true,
// 	resave: true,
// 	isLogged: false,
// 	username: '',
// 	email: '',
// 	cookie: { maxAge: 18000000 } //1/2 hour in ms
// });


// ------ Server ------
app.set('view engine', 'ejs');
app.set('views', __dirname + '/Views');
app.use(express.static(__dirname + '/public'));
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use(cookie());
app.use(session(sessionFormat));
//app.use(session);

//npm install -i
server.listen(PORT, () => console.log('First ship has sailed on port: ' + PORT));

// --- Configuration Socket io and express-session
//io.use(sharedsession(session, {autoSave: true}));

io.on('connection', function(socket) {
	socket.on('ready', function(player) {
		console.log('player: ' + player + ' is ready for battle!');
	});
	
	// var id = socket.id;
	// console.log('players ', players);
	
	// var socket_session = socket.handshake.session;
	// var socket_session_id = socket.handshake.sessionID;

	// // console.log("SOCKET_SESSION:",socket_session);
	// // console.log("SOCKET_SESSION_ID:",socket_session_id);
	
	// if (players.length >= 2){ 
	// 	//socket.emit('RoomIsFull', true);
	// 	console.log('Room is full');
	// 	return;
	// }

	// socket.on('join',function(identifier){
    //     socket.id = identifier;
    //     console.log('The Player '+socket.id+' joined the chatroom'); 
    //     console.log(players);
    //     io.emit('update'," ### "+socket.id+" joined the chatroom  ###");
    // });
	

	// //Mechanism of fire reaction
	// socket.on('fire', function(obj) {
	// 	turns++;
	// 	var enemy = []; //declaring the enemy with the coordinates

	// 	players.map(function(player) {
	// 		if (players.id != socket.id) return (enemy = player);
	// 	});
	// 	console.log('Enemy', enemy.id);

	// 	var hit = enemy.ships
	// 		.map((ship) => ship.location)
	// 		.some((coordinates) => coordinates.some((coordinate) => coordinate == obj.coordination));

	// 	if (hit) {
	// 		enemy.takenHits++;
	// 		console.log('Hit! ' + obj.coordination);
	// 		console.log('Hit!', { coordination: obj.coordination, hit: hit });

	// 		if (enemy.takenHits >= 17) {
	// 			// If hits all the ships (5+4+3+3+2 = 17) wins
	// 			socket.emit('win', enemy);
	// 		} else {
	// 			console.log('missed');
	// 			console.log(obj.coordination);
	// 		}
	// 	}

	// 	socket.broadcast.emit('updateBroadcast', { coordination: obj.coordination, enemy: enemy });

	// 	permissionToFire(enemy.id, function() {
	// 		io.sockets.connected[enemy.id].emit('permissionFire', enemy);
	// 	});
	// 	console.log(enemy);

	// 	socket.on('disconnect', function() {
	// 		players.map(function(player, index) {
	// 			if (player.id == id) players.splice(index, 1);
	// 		});
	// 		console.log(id + ' player left ' + players.length);
	// 	});
	// });

	// //The player creation
	// players.push({ id: id, ready: true, takenHits: 0, permissionToFire: false, ships: [] });

	socket.on('disconnect', function() {
		console.log('Player ', socket.id, ' left the game');
	});
});

// ------ Routes ------
app.get('/', (req, res) => res.render('index', { session: req.sessionID, status: req.session.isLogged, username: req.session.username }));
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.get('/logout', function(req, res) {
	req.session.destroy();
	res.redirect('/');
});

app.post('/register', function(req, res) {
	if (req.body.emailcheck == 1) {
		makeQuery(`Select email From user Where email = "${req.body.email}"`, function(result) {
			if (result.length > 0) res.json('taken');
			else res.send('avaliable');
		});
	} else {
		makeQuery(
			"INSERT INTO user (username, email, password) VALUES ('" +
				req.body.name +
				"', '" +
				req.body.email +
				"', '" +
				crypt(req.body.pass) +
				"')",
			function(result) {
				req.session.isLogged = true;
				req.session.username = req.body.name;
				req.session.email = req.body.email;
				res.send('Done!');
			}
		);
	}
});
app.post('/login', function(req, res) {
	makeQuery(`Select * From user Where email = "${req.body.email}"`, function(result) {
		if (result.length == 0) res.json('Dados inválidos');
		else if (result[0].password == crypt(req.body.password)) {
			req.session.isLogged = true;
			req.session.username = result[0].username;
			req.session.email = result[0].email;
			res.send('done!');
		}
	});
});
// ------ Database ------

var database = mysql.createConnection({
	host: HOST,
	port: DB_PORT,
	user: DB_USER,
	password: DB_PASSWORD
});

function checkDatabase() {
	database.connect(function(error, result) {
		if (error) throw error;
		if (result) {
			console.log('Connection to database established.');
			console.log('Attempting to select database: ' + DB_NAME);
			database.query('USE ' + DB_NAME, function(error, result) {
				if (error) {
					console.log('Error! Database: ' + DB_NAME + ' not found! Creating...');
					database.query('CREATE DATABASE ' + DB_NAME, function(error, result) {
						if (error) throw error;
						if (result) {
							console.log('Database ' + DB_NAME + ' created!');
							database.query('USE ' + DB_NAME, function(error, result) {
								if (error) throw error;
								else checkTableUser();
							});
						}
					});
				} else checkTableUser();
			});
		}
	});
}

function checkTableUser() {
	console.log('Checking for users table...');
	database.query('SELECT NULL FROM user', function(error, result) {
		if (error) {
			console.log('Error! Table user not found! Creating...');
			database.query(
				'CREATE TABLE user(id INT AUTO_INCREMENT PRIMARY key NOT NULL,' +
					'username VARCHAR(50) NOT NULL,' +
					'email VARCHAR(50) NOT NULL,' +
					'password VARCHAR(256) NOT NULL)',
				function(err, result) {
					if (err) console.log(err);
					if (result) {
						console.log('Table user created!');
						console.log('Setup was correct!');
						console.log('Welcome aboard captain!');
						checkTableGames();
					}
				}
			);
		}
		if (result) {
			console.log('Everything looks ready!');
			checkTableGames();
		}
	});
}
function checkTableGames() {
	console.log('Checking for games table...');
	database.query('SELECT NULL FROM game', function(error, result) {
		if (error) {
			console.log('Error! Table games not found! Creating...');
			database.query(
				'CREATE TABLE game(' +
					'id INT AUTO_INCREMENT PRIMARY key NOT NULL,' +
					'player1 INT NOT NULL,' +
					'player2 INT NOT NULL,' +
					'gameState longtext NOT NULL,' +
					'shipPlayer1 longtext NOT NULL,' +
					'shipPlayer2 longtext NOT NULL,' +
					'CONSTRAINT P1 FOREIGN KEY (player1) REFERENCES user(id),' +
					'CONSTRAINT P2 FOREIGN KEY (player2) REFERENCES user(id)' +
					')',
				function(err, result) {
					if (err) console.log(err);
					if (result) {
						console.log('Table game created!');
						console.log('Setup was correct!');
						console.log('Welcome aboard captain!');
					}
				}
			);
		}
		if (result) {
			console.log('Everything looks ready!');
			console.log('Welcome aboard captain!');
		}
	});
}
checkDatabase();

// ------ Queries ------

function makeQuery(query, callback) {
	database.query(query, function(error, result) {
		if (error) console.log('There was an error: \n' + error);
		return callback(result);
	});
}

