var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(client){
  console.log("Client connected...");
});

app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");
});

server.listen(8080);