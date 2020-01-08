// ------ Configs ------
const PORT = 8080;
const HOST = 'localhost';
const DB_USER = 'root';
const DB_PASSWORD = '';
const DB_PORT = 3306;
const DB_NAME = 'battleship';

// ------ Dependencies ------
const EXPRESS = require('express');
const HTTP = require('http');
const EJS = require('ejs');
const SOCKET_IO = require('socket.io');
const APP = EXPRESS();
const SERVER = HTTP.Server(APP);
const IO = SOCKET_IO(SERVER);
const MYSQL = require('mysql');
const CRYPT = require('crypto-js/sha256');

// --- Communication ---
IO.on('connection', function(socket) {
	socket.on('register', function(email, name, pass) {
		register(
			"INSERT INTO user (username, email, password) VALUES ('" +
				name +
				"', '" +
				email +
				"', '" +
				CRYPT(pass) +
				"')"
		);
	});
});

// ------ Routes ------
APP.get('/', (req, res) => res.render('index'));
APP.get('/login', (req, res) => res.render('login'));
APP.get('/register', (req, res) => res.render('register'));

// ------ Server ------
APP.set('view engine', 'ejs');
APP.set('views', __dirname + '/Views');
APP.use(EXPRESS.static(__dirname + '/public'));
SERVER.listen(PORT, () => console.log('First ship has sailed on port: ' + PORT));

// ------ Database ------

var connection = MYSQL.createConnection({
	host: HOST,
	port: DB_PORT,
	user: DB_USER,
	password: DB_PASSWORD
});

function checkDatabase() {
	connection.connect(function(error, result) {
		if (error) throw error;
		if (result) {
			console.log('Connection to database established.');
			console.log('Attempting to select database: ' + DB_NAME);
			connection.query('USE ' + DB_NAME, function(error, result) {
				if (error) {
					console.log('Error! Database: ' + DB_NAME + ' not found! Creating...');
					connection.query('CREATE DATABASE ' + DB_NAME, function(error, result) {
						if (error) throw error;
						if (result) {
							console.log('Database ' + DB_NAME + ' created!');
							connection.query('USE ' + DB_NAME, function(error, result) {
								if (error) throw error;
								else checkTables();
							});
						}
					});
				} else checkTables();
			});
		}
	});
}

function checkTables() {
	connection.query('SELECT NULL FROM user', function(error, result) {
		if (error) {
			console.log('Error! Table users not found! Creating...');
			connection.query(
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
						endSetup();
					}
				}
			);
		}
		if (result) {
			console.log('Everything looks ready!');
			console.log('Welcome aboard captain!');
			endSetup();
		}
	});
}

function endSetup() {
	connection.end();
	connection = MYSQL.createConnection({
		host: HOST,
		port: DB_PORT,
		user: DB_USER,
		database: DB_NAME,
		password: DB_PASSWORD
	});
}

checkDatabase();

// ------ Queries ------
function register(query) {
	connection.connect(function(error) {
		if (error) console.log('Database not responding');
	});

	console.log('Inserting new user!');
	connection.query(query, function(error, result) {
		if (error) {
			console.log('There was an error!!!!!');
			console.log(error);
			connection.end();
		} else {
			console.log('Insert sucessefull!');
			connection.end();
		}
	});

	console.log(query);
}
