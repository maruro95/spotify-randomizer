// import express
var express = require('express');		// npm install --save express
var app = express();

// import node.js http
var server = require('http').Server(app);

// import socket.io
var io = require('socket.io')(server);	// npm install --save socket.io

// import filesystem (aka fs)
var fs = require('fs');

// import spotify we api 
var SpotifyWebApi = require('spotify-web-api-node');

/* -----------------------------------
  Spotify Authetication (OAuth) Configuration
--------------------------------------*/

// access token use to autheticate with Instagram
var access_token = null;

// load configuration file with credentials, secrets, etc.
var config_file = "./spotify_credentials.json";
var config = JSON.parse(fs.readFileSync(config_file, "utf8"));

var spotify = new SpotifyWebApi({
  clientId : config.client_id,
  clientSecret : config.client_secret
});


spotify.clientCredentialsGrant()
  .then(function(data) {
    spotify.setAccessToken(data.body.access_token);
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err.message);
  });

/*------------------------
  SPOTIFY FUNCTIONS
--------------------------*/

function search_for_tracks(keyword, callback) {

  console.log('search_for_tracks: ' + keyword);

  var options= {
    limit: 50
  }

  spotify.searchTracks(keyword, options, function(err, data) {   
      
    if (err) {
      console.error('Something went wrong', err.message);
      return;
    }

    callback(data.body.tracks.items);

  });

}
  
  function search_playlist (keyword, callback) {

    spotifyApi.searchPlaylists(keyword)
    .then(function(data) {
      console.log('Found playlists are', data.body);
    }, function(err) {
      console.log('Something went wrong!', err);
    });

  }

/* -----------------------------
	Configure Socket.io 
--------------------------------*/

// configure socket.io
// (1) when there is a connection 
io.on('connection', function(socket) {

  console.log('got a connection');

  // (2) configure the connected socket to receive custom messages ('message from human')
  socket.on('search_spotify', function(msg) {

  	console.log('searching spotify with: ' + JSON.stringify(msg));

  	search_for_tracks(msg.keyword, function(results) {
  		// send raw results
  		io.emit('search_spotify_results', results);
  	});


  });

  socket.on('disconnet', function() {

  	console.log('got a disconnection');
  	
  });

});  

/* ------------------------------------
	Main entry point for the server
----------------------------------------*/

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

/* -------------------
	Start the server
----------------------*/

// listen to connection on port 8088 --> http://localhost:8088
server.listen(8088, function () {
	console.log('listening on port: ' + 8088);
}); 
