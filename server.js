// ------ Configs
const port = 8080;

// ------ Dependencies
const express = require('express');
const http = require('http');
const app = express();
const server = http.Server(app);

// ------ Routes
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/Views/index.html');
});

// ------ Server
server.listen(port, function() {
	console.log('First ship has sailed on port ' + port + '!');
});
