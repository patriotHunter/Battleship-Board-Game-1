// ------ Configs ------
const PORT = 8080;
const HOST = 'localhost';
const DB_USER = 'root';
const DB_PASSWORD = '';
const DB_PORT = 3306;
const DB_NAME = 'battleship';
// ------ Variables ------
var session = {
	secret: 'radio silence',
	saveUninitialized: true,
	resave: true,
	isLogged: false,
	name: '',
	email: '',
	cookie: { maxAge: 36000000 } //1 hour in ms
};
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
const PARSER = require('body-parser');
const COOKIE = require('cookie-parser');
const SESSION = require('express-session');

// ------ Server ------
APP.set('view engine', 'ejs');
APP.set('views', __dirname + '/Views');
APP.use(EXPRESS.static(__dirname + '/public'));
APP.use(PARSER.urlencoded({ extended: false }));
APP.use(PARSER.json());
APP.use(COOKIE());
APP.use(SESSION(session));

SERVER.listen(PORT, () => console.log('First ship has sailed on port: ' + PORT));

// --- Communication ---
// IO.on('connection', function(socket) {
// 	socket.on('register', function(email, name, pass) {
// 		makeQuery(
// 			"INSERT INTO user (username, email, password) VALUES ('" +
// 				name +
// 				"', '" +
// 				email +
// 				"', '" +
// 				CRYPT(pass) +
// 				"')"
// 		);
// 	});
// });

// ------ Routes ------
APP.get('/', (req, res) => res.render('index', { isLogged: session.isLogged, name: session.name }));
APP.get('/login', (req, res) => res.render('login'));
APP.get('/register', (req, res) => res.render('register'));
APP.get('/logout', function(req, res) {
	session.isLogged = false;
	session.name = '';
	session.email = '';
	res.redirect('/');
});

APP.post('/register', function(req, res) {
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
				CRYPT(req.body.pass) +
				"')",
			function(result) {
				session.isLogged = true;
				session.name = req.body.name;
				session.email = req.body.email;
				res.send('Done!');
			}
		);
	}
});
APP.post('/login', function(req, res) {
	makeQuery(`Select * From user Where email = "${req.body.email}"`, function(result) {
		if (result.length == 0) res.json('Dados inválidos');
		else if (result[0].password == CRYPT(req.body.password)) {
			session.isLogged = true;
			session.name = result[0].name;
			session.email = result[0].email;
			res.send('done!');
		}
	});
});
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

function makeQuery(query, callback) {
	database.query(query, function(error, result) {
		if (error) console.log('There was an error: \n' + error);
		return callback(result);
	});
}
