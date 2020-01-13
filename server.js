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
var room = [];

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
const session = require('express-session')({
	secret: 'radio silence',
	saveUninitialized: true,
	resave: true,
	isLogged: false,
	username: '',
	email: '',
	cookie: { maxAge: 18000000 } //1/2 hour in ms
});

// ------ Server ------
app.set('view engine', 'ejs');
app.set('views', __dirname + '/Views');
app.use(express.static(__dirname + '/public'));
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use(cookie());
app.use(session);
io.use(sharedsession(session, { autosave: true }));

server.listen(PORT, () => console.log('First ship has sailed on port: ' + PORT));

// ------ Communication ------

io.on('connection', function(socket) {
	socket.on('ready', function(player) {
		for (i = 0; i < room.length; i++) {
			console.log(room[i]);
			if (room[i].players === 1) {
				room[i].players = 2;
				socket.join(room[i].name);
				return socket.emit('joined', { room: room[i].name, turn: true });
			}
		}
		var roomName = (Math.random() + 1).toString(36).slice(2, 18);
		room.push({ name: roomName, players: 1 });
		socket.join(roomName);
		return socket.emit('joined', { room: roomName, turn: false });
	});

	socket.on('fire', (data) => socket.broadcast.to(data.room).emit('fired', data.tile));
	socket.on('hit', (data) => socket.broadcast.to(data.room).emit('hited', data.tile));
	socket.on('miss', (data) => socket.broadcast.to(data.room).emit('missed', data.tile));
	socket.on('win', (data) => socket.broadcast.to(data.room).emit('won', data.msg));

	socket.on('login', function(userdata) {
		socket.handshake.session.userdata = userdata;
		socket.handshake.session.save();
	});
	socket.on('logout', function(userdata) {
		if (socket.handshake.session.userdata) {
			delete socket.handshake.session.userdata;
			socket.handshake.session.save();
		}
	});
	socket.on('disconnect', function() {
		console.log('Player ', socket.id, ' left the game');
	});
});

// ------ Routes ------
app.get('/', (req, res) =>
	res.render('index', { session: req.sessionID, status: req.session.isLogged, username: req.session.username })
);

app.get('/login', (req, res) => {
	io.emit('login', req.session);
	res.render('login');
});

app.get('/register', (req, res) => res.render('register'));
app.get('/logout', function(req, res) {
	io.emit('logout', req.session);
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
