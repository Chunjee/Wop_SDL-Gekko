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


	//Promises
var Promise = require('bluebird');
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
//assign express
var app = express();
app.use("/static", express.static(__dirname + "/public"));



//Set Template Engine
app.set('view engine', 'jade');
app.set('views', __dirname + '/templates');


///--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// PREP AND STARTUP
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/
console.log("Started on " + Date());

var	amt_array = [
		{
		"name": "tvgvpramt01",
		"date": ""
		},
		{
		"name": "tvgvpramt02",
		"date": ""
		},
		{
		"name": "tvgvpramt03",
		"date": ""
		},
		{
		"name": "tvgvpramt04",
		"date": ""
		},
		{
		"name": "tvgvpramt05",
		"date": ""
		},
		{
		"name": "tvgvpramt06",
		"date": ""
		}
	];

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
app.get('/tools_page', function(req, res){
	//just render
	res.render('tools_page');
});

//AMT_Status
app.get('/amt_status', function(req, res){
	
	//start checking all AMTs for todays date
	for (var i = amt_array.length - 1; i >= 0; i--) {
		request('api/amtstatus', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	//parse the response
		  	var body_obj = JSON.parse(body)
		    
		    //asign path to res so it can be accessed outside the function //NOTE: res.locals are available to the rendering engine
		    res.locals.statuses = body_obj;
		    res.render('amt_status');
		    return;
		  }
		});
	};
	//render after reciving response from all
	res.render('amt_status');
	//res.locals.statuses = amtresult_array;
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


//All API Endpoints
app.get('/api/:endpoint?', function(req, res){
	//grab the endpoint
	var endpoint = req.params.endpoint;
	//log the request
	console.log("API Request: " + endpoint);
	if (endpoint === undefined) {
		res.status(503);
		res.send("documentation under construction");
		return
	} else {
		if (endpoint === "amtstatus") {
			var promise_array = amt_array.map(function (amt) {
			    return getAMTDate(amt);
			});

			Promise.all(promise_array)
			.then( function(resolved_array) {
			    resolved_array.forEach(function (response, idx) {
			        console.log(response.name + ": " + response.date);
				});
				amt_array = resolved_array;
				res.send(amt_array);
			}).catch(function (err) {    
			    console.error('Something went wrong: '+err);
			});
			return
		}
	}

	//user requested an endpoint that is not defined here
	res.send("that endpoint does not exist");
	//res.end();
});

//~~~~~~~~~~~~~~~~~~~~~
// HTTP
//~~~~~~~~~~~~~~~~~~~~~

app.listen(3000, function() {
	console.log("The frontend server is running on port 3000");
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

function Fn_checkAMTsDate(para_serversarray) {
	var promises_array = para_serversarray.map(getAMTDate);
	return qPromise.all(promises_array);
}

function getAMTDate(para_Sever) {
//para_Server is an object
    return new Promise(function (resolve, reject) {
	   request('http://' + para_Sever["name"] + ':80/TSG/api/session/date', function (error, response, body) {
           // pretend it works. Remove the three lines below in real life....
           error = false;
           response = { statusCode : 200 };
           
            if (!error && response.statusCode === 200) {
                //parse the response and assign it to the resolved return
                var body_obj = JSON.parse(body);
                resolve({
                    name: para_Sever.name,
                    date: body_obj.response
                });
            } else {
                //there was no reply
                reject(error || response.statusCode);
            }
	   });
    });
}







function Fn_checkAMTsDateOLD() {
	//var amt_array = ["tvgvpramt01","tvgvpramt02","tvgvpramt03","tvgvpramt04","tvgvpramt05","tvgvpramt06"]

	var	amt_array = [
		{
		"name": "tvgvpramt01",
		"date": ""
		},
		{
		"name": "tvgvpramt02",
		"date": ""
		},
		{
		"name": "tvgvpramt03",
		"date": ""
		},
		{
		"name": "tvgvpramt04",
		"date": ""
		},
		{
		"name": "tvgvpramt05",
		"date": ""
		},
		{
		"name": "tvgvpramt06",
		"date": ""
		}
	];
	
	//check the date on each sever
	for (var i = amt_array.length - 1; i >= 0; i--) {
		request('http://' + amt_array[i]["name"] +':80/TSG/api/session/date', amt_array[i]["date"] = function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				//parse the response
				var body_obj = JSON.parse(body);
				console.log(body_obj.response);
				return body_obj.response
				// = body_obj.response //<<<<------ This doesn't work because no access to i inside the callback function?
			} else {
				//there was no reply
			}
		});
	}

	//fails as callback has not returned with answer yet
}

//SDL_CLASS
function SDL_class(para_SystemName,para_Location) {
this.name = para_SystemName;
this.location = para_Location;

//console.log("New SDL created with " + this.name + " at: " + this.location);
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
