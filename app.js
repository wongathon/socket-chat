var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var redis = require('redis');
var redisClient = redis.createClient();
var port = process.env.PORT || 8080;


redisClient.on("error", function(err){
  console.log("Error w/ redis " + err);
});

redisClient.flushall();

var storeMessage = function(name, data){
  var message = JSON.stringify({name: name, data: data });
  redisClient.lpush("messages", message, function(err, response){
    redisClient.ltrim("messages", 0, 9);
  });
}

//All Socket Methods
io.on('connection', function(client){

  client.on('join', function(name){  
    client.nickname = name;
    console.log(name + " joined the chat");
    io.emit("add chatter", name);

    redisClient.smembers("usernames", function(err, names){
      names.forEach(function(name){
        client.emit('add chatter', name);
      });
    });

    redisClient.sadd("usernames", name);
    redisClient.lrange("messages", 0, -1, function(err, messages){
      messages = messages.reverse();
      messages.forEach(function(msg){
        msg = JSON.parse(msg);
        client.emit("messages", msg.name + ": " + msg.data);
      });
    });

    redisClient.smembers("usernames", function(err, names){
      console.log(names);
    });
  });

  //Send Messages to others
  client.on('messages', function(data){
    var nickname = client.nickname;
    io.emit("messages", nickname + ": " + data);
    storeMessage(nickname, data);
  });

  //Disconnect
  client.on('disconnect', function(it){
    redisClient.smembers("usernames", function(err, names){
      client.broadcast.emit("remove chatter", client.nickname);
      console.log(client.nickname + " disconnected");
      redisClient.srem("usernames", client.nickname);
    });
  });
});

app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");
});

server.listen(port);
console.log("App Listening on "+port);