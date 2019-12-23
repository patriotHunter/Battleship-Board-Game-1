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

// ------ Routes ------
APP.get('/', function(req, res) {
	res.render('index');
});

// ------ Server ------

APP.set('view engine', 'ejs');
APP.set('views', __dirname + '/Views');

SERVER.listen(PORT, function() {
	console.log('First ship has sailed on port: ' + PORT);
});

// ------ Database ------

var connection = MYSQL.createConnection({
	host: HOST,
	port: DB_PORT,
	user: DB_USER,
	password: DB_PASSWORD
});

function startDatabase() {
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
				console.log('Welcome aboard captain!');
			});
		} else console.log('Welcome aboard captain!');
		connection.end();
	});
}

startDatabase();
