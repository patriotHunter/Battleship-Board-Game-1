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

var database = MYSQL.createConnection({
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
	console.log('Checking for users table...');
	database.query('SELECT NULL FROM user', function(error, result) {
		if (error) {
			console.log('Error! Table users not found! Creating...');
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

function register(query) {
	database.query(query, function(error, result) {
		if (error) console.log('There was an error: \n' + error);
		else console.log('Register sucessfull!');
	});
}
