var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;


io.on('connection', function(client){
  console.log('Client Connection!');

  client.on('join', function(name){
    client.nickname = name;
  });
  //client.emit('messages', { hello: 'world' });
  client.on('messages', function(data){
    var nickname = client.nickname;
    console.log(data);
    io.emit("messages", nickname + ": " + data);
  });

  client.on('disconnect', function(){
    console.log("Client disconnected")
  });

});


app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");
});

server.listen(port);