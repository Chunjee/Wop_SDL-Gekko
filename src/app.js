///--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// Description
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/
// Checks each platform for willpay and probable data. Hopefully it can eventually illuminate other problems at tote
//

//~~~~~~~~~~~~~~~~~~~~~
//Compile Options
//~~~~~~~~~~~~~~~~~~~~~
"use strict";


//Dependencies
	//jquery
var jsdom = require('jsdom');
jsdom.env(
  "https://iojs.org/dist/",
  ["http://code.jquery.com/jquery.js"],
  function (err, window) {
    //console.log("there have been", window.$("a").length - 4, "io.js releases!");
    //var $ = window.$;
  }
);
//var $ = require('jquery');

	//request
var request = require('request');
	//Express
var express = require('express');
var	fs = require("fs"),
	posts = require('./sample_data/posts.json');

	//map the keys to "key" and return each of those to values to postsLists
	var postsList = Object.keys(posts).map(function(key) {
		return posts[key]
	});
	console.log(postsList);
//assign express
var app = express();
app.use("/static", express.static(__dirname + "/public"))



//Set Template Engine
app.set('view engine', 'jade');
app.set('views', __dirname + '/templates')


///--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// PREP AND STARTUP
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/
console.log("Started on " + Date());



setInterval(checkSDL, 1000*60*5); //re-index the SGR every 5 mins


//~~~~~~~~~~~~~~~~~~~~~
// Routes
//~~~~~~~~~~~~~~~~~~~~~

//ROOT
app.get('/', function(req, res){
	//grab the path the user is traveling to
	var path = req.path;
	//asign path to res so it can be accessed outside the function //NOTE: res.locals are available to the rendering engine
	res.locals.path = path;
	res.render('index')
});


//AMT_Status
app.get('/amt_status', function(req, res){
	
	//start checking all AMTs for todays date
	for (var i = amt_array.length - 1; i >= 0; i--) {
		request('http://' + amt_array[i] +':80/TSG/api/session/date', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	//parse the response
		  	var body_obj = JSON.parse(body)
		    console.log(body_obj.response);
		    amtresult_array += body_obj.response + "/n"
		    //re-render
		    res.locals.statuses = amtresult_array;
		    done = true
		    //asign path to res so it can be accessed outside the function //NOTE: res.locals are available to the rendering engine
		    //res.render('amt_status');
		  }
		});
	};
	//render after reciving response from all
	while (done === false) {
		res.render('amt_status');
	}
	//res.locals.statuses = amtresult_array;
	res.render('amt_status');
	res.end();
});

app.get('/blog/:title?', function(req, res){ 
	var title = req.params.title;
	console.log("someone wants to access:" + title)

	if (title === undefined) {
		res.status(503);
		res.render("blog", { posts: postsList});
		//res.send("This page is under construction! (actually no its done)");
	} else {
		var post = posts[title] || {}; //asign post to the post.%title% or an empty object if it does not exist.
		res.render("post", { post: post});
	}
});

//~~~~~~~~~~~~~~~~~~~~~
// HTTP
//~~~~~~~~~~~~~~~~~~~~~

app.listen(3000, function() {
	console.log("The frontend server is running on port 3000!");
});


//--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// MAIN
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/

var AmToteSDL = new SDL_class("alf", "location");
//AmToteSDL.pull_file();







//--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// Function Staging
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/

function checkSDL() {
	//Loop all known SDLs and start re-reading the file
}


function checkAMTsDate() {
	var amt_array = ["tvgvpramt01","tvgvpramt02","tvgvpramt03","tvgvpramt04","tvgvpramt05","tvgvpramt06"]
}

//SDL_CLASS
function SDL_class(para_SystemName,para_Location) {
this.name = para_SystemName;
this.location = para_Location;

console.log("New SDL created with " + this.name + " at: " + this.location);
}

SDL_class.prototype.pull_file = function () {
	//has access to this.name and all this properties
	console.log("tried to pull file and failed.");
}





//--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// Notes
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/

/*
fs.readFile("./files/sample.txt", function(error, data) {
	console.log("Content of File:" + data);
});
*/


/*
//readFileSync good for loading initial server config files
var filecontents = fs.readFileSync("./files/sample.txt");

var config = JSON.parse(filecontents);
console.log(config.samplekey);


//OR in one line:
var config = JSON.parse(fs.readFileSync("./files/sample.txt"));
*/



/*
//Writing a file
fs.writeFileSync("./samplewrite.txt" "Hello World!/n");

fs.writeFile(("./samplewrite.txt" "Hello World!/n", function(error) {
	console.log("File Finished Written")
});
*/


/*
//Watch a file
fs.watchFile("./files/config.json", function(current, previous) {
	console.log("config file changed!?");
	config = JSON.parse(fs.readFileSync("./sampleconfig.txt"));
	console.log("config file re-parsed!");
})
*/
