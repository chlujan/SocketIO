#!/usr/bin/env node

"use strict";

var express = require("express"),
    app = express(),    
    http = require("http"),
    server = http.createServer(app),
    socketIO = require("socket.io"),
    io = socketIO(server),

    bodyParser = require('body-parser'),
    mongoose = require("mongoose");
        

app.use(express.static(__dirname + "/client"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost/amazeriffic');

var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

server.listen(3000);

io.on("connection", function(socket) {
	socket.on("message", function(msg){
		console.log("message: " + msg);
	});
});

io.on("connection", function(socket) {
	socket.on("list", function(msg){
		socket.broadcast.emit("message", msg);
		console.log("list: " + msg);
	});
});

app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
	res.json(toDos);
    });
});

app.post("/todos", function (req, res) {
    var newToDo = new ToDo({"description":req.body.description, "tags":req.body.tags});
    newToDo.save(function (err, result) {
	if (err !== null) {
	    // the element did not get saved!
	    console.log(err);
	    res.send("ERROR");
	} else {
	    // our client expects *all* of the todo items to be returned, so we'll do
	    // an additional request to maintain compatibility
	    ToDo.find({}, function (err, result) {
		if (err !== null) {
		    // the element did not get saved!
		    res.send("ERROR");
		}
		res.json(result);
	    });
	}
    });
});

var address = server.address();
console.log("Server is listening at http://localhost:" + address.port + "/");
