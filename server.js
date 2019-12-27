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
APP.get('/', function(req, res) {
	res.render('index');
});

APP.get('/login', function(req, res) {
	res.render('login');
});


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
	connection.connect(function(error) {
		if (error) throw error;
		console.log('Connection to database established.');
		console.log('Selecting database: ' + DB_NAME);
	});

	connection.query('USE ' + DB_NAME, function(err, result) {
		if (err) {
			console.log('Error! Database: ' + DB_NAME + ' not found! Creating...');
			connection.query('CREATE DATABASE ' + DB_NAME, function(err, result) {
				if (err) throw err;
				console.log('Database ' + DB_NAME + ' created!');
			});
		} else console.log('Database selected!');

		connection.query('SELECT NULL FROM user', function(err, result) {
			if(err){
				console.log('Error! Table users not found! Creating...');
				connection.query(
					'CREATE TABLE user(id INT AUTO_INCREMENT PRIMARY key NOT NULL,' +
						'username VARCHAR(50) NOT NULL,' +
						'email VARCHAR(50) NOT NULL,' +
						'password VARCHAR(256) NOT NULL)',
					function(err, result) {
						if (err) console.log(err);
						console.log('Table user created!');
					}
				);
			}
		});

		console.log('Welcome aboard captain!');
		
		//connection.end();
	});
}

checkDatabase();

// ------ Queries ------
function register(query) {
	connection.connect(function(error) {
		if (error) console.log('Database not responding');
	});

	connection.query('USE ' + DB_NAME, function(error, result) {
		if (error) console.log('cant reach database: ', error);
	});

	console.log('Inserting new user!');
	connection.query(query, function(error, result) {
		if (error) {
			console.log('There was an error!!!!!');
			console.log(error);
		} else {
			console.log('Insert sucessefull!');
			console.log(result);
		}
	});

	console.log(query);
}
