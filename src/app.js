///--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// Description
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/
// Checks each platform for willpay and probable data. Hopefully it can eventually illuminate other problems at tote
//

//~~~~~~~~~~~~~~~~~~~~~
//RunTime Options
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
	//Tail
var Tail = require('tail-forever');
	//Slack
var Slack = require('machinepack-slack');

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
var alltracks = "";
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

//Tools_page
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

//Tracklist
app.get('/tracklist_page', function(req, res){
	res.render('tracklist_page');
	//res.locals.statuses = amtresult_array;
	//res.end();
	return
});

//Status Page
app.get('/status_page', function(req, res){
	res.render('status_page');
	return
});

//SDL Page
app.get('/sdl_page', function(req, res){
	res.render('sdl_page');
	return
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
		//AMT Status
		if (endpoint === "amtstatus") {
			var promise_array = amt_array.map(function (amt) {
				return getAMTDate(amt);
			});

			Promise.all(promise_array)
			.then( function(resolved_array) {
				resolved_array.forEach(function (response, idx) {
					//console.log(response.name + ": " + response.date);
				});
				amt_array = resolved_array;
				res.send(amt_array);
			}).catch(function (err) {
			    console.error('Something went wrong: ' + err);
			});
			return
		}

		//Tracks
		if (endpoint === "tracks") {
			var blank_array = [
				{
				"name": "this array is blank",
				}
			]
			var tracks_promise = blank_array.map(function (amt) {
				return getTracks();
			});


			Promise.all(tracks_promise)
			.then( function(resolved_var) {
				res.send(resolved_var);
			}).catch(function (err) {
				console.error('Something went wrong: ' + err);
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

app.listen(80, function() {
	console.log("The frontend server is running on port 80");
});

//--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// MAIN
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/

var AmToteSDL = new SDL_class("alf", "location");
//AmToteSDL.pull_file();



//--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// Function Staging
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/


var tail = new Tail("\\\\Tvgvprdds02\\tvg\\LogFiles\\MessageBroker_2016-01-25.log",{});
console.log("listening to today's messagebroker");

//for each new message
tail.on("line", function(line) {
	var Message_Obj = MessageSeverityGutCheck(line);
	//only display messages to the user if they are FATAL or SEVERE
	if (Message_Obj.Severity === 1 || Message_Obj.Severity === 2) {
		console.log(Message_Obj.Message);
		SlackPost(Message_Obj.Message)
	}
});
tail.on("error", function(error) {
  console.log('ERROR with MessageBroker file: ', error);
});


//checks incomming messages against our list of severity
function MessageSeverityGutCheck(para_Input) {
	var Output_Obj = [];
	Output_Obj.RawMessage = para_Input;

	//1 - Fatal; sites are totally down or impacting some percentage of wagers
	if (InStr(para_Input,"may have hung")) {
		Output_Obj.Severity = 1;
		Output_Obj.Message = "DataService needs to be checked";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Fatal"
	}
	if (InStr(para_Input,"Error getting account balance") || InStr(para_Input,"Window NoTote")) {
		Output_Obj.Severity = 1;
		Output_Obj.Message = "Tote windows are down";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/RC+-33+error+message+on+DDS+TIP+down+procedures"
	}

	//2 - Severe; errors impact the customer and should be solved as soon as possible
	if (InStr(para_Input,"Could not find server")) {
		Output_Obj.Severity = 2;
		Output_Obj.Message = "DBA issue";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/RPC+server+is+unavailable"
	}
	if (InStr(para_Input,"RPC server is unavailable")) {
		Output_Obj.Severity = 2;
		Output_Obj.Message = "Restart the effected server";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/RPC+server+is+unavailable"
	}
	if (InStr(para_Input,"Dialogic")) {
		Output_Obj.Severity = 2;
		Output_Obj.Message = "IVR has missing pool or other Dialogic error";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/IVR+Dialogic+Error"
	}
	
	//3 - Warnings; require some action be taken at some point, but have little to no impact
	if (InStr(para_Input,"Truncation errors")) {
		Output_Obj.Severity = 3;
		Output_Obj.Message = "please start the log service at your convenience";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/String+Data+Right+Truncation+errors+on+DDS"
	}
	if (InStr(para_Input,"Finisher data contains shared betting interest:")) {
		Output_Obj.Severity = 3;
		Output_Obj.Message = "Coupled Entry just placed in a race";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Warning"
	}

	//4 - Informational; totally normal operational messages
	if (InStr(para_Input,"Payment type not bound")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "everything is good";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Update Race where")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "X track with Y abbreviation for Z day has an invalid time format";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Invalid+Time+Format+Error"
	}
	if (InStr(para_Input,"Error in Automated Bet Reviewer")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "???";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Results  are  final")) { //for some reason they had two spaces
		Output_Obj.Severity = 4;
		Output_Obj.Message = "Race just went official";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"unreconciled bets selected")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "BOP is working on reconciling bets";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Opening new account")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "new account created";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Creating tote account")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "Customers account was created at Tote";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"A horse was scratched")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "A horse was scratched";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"A horse was livened")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "A horse was livened";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"The race has closed")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "A race just closed";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Data has been parsed for Track")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "track is not available via Gatewayl; typically OK"; //might need more research on this one
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"now available via the SGRGateway")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "Track just became available over the SGRGateway";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Message Monitor")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "Someone has connected to the messagebroker with messagemonitor";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"ThreadStart()")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "a new thread entered from the DataCollector";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"alf")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "ALF";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}



	//if this messagetype has never been encountered
	if (Output_Obj.Severity === undefined) {
		Output_Obj.Severity = 2;
		Output_Obj.Message = "unhandled message type:" + Output_Obj.RawMessage;
	}

	//give back the Output_Obj
	return Output_Obj;
}

function InStr(para_String, para_needle) {
	var Output = para_String.indexOf(para_needle);
	if (Output === -1) {
		return 0
	} else {
		return 1
	}
}


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

function getTracks() {
//para_Server is an object
    return new Promise(function (resolve, reject) {
	   request('http://tvgvpramt01/TSG/api/session', function (error, response, body) {
           // pretend it always works
           error = false;
           response = { statusCode : 200 };
           //console.log(response);

            if (!error && response.statusCode === 200) {
                //save the response to our global var and resolve the promise
                var body_obj = JSON.parse(body);
                alltracks = body;
                resolve(body_obj);
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


function SlackPost(para_Message) {

	Slack.postToChannel({
	webhookUrl: '',
	channel: '#messagebroker',
	message: para_Message,
	username: 'Gekkō',
	iconEmoji: ':new_moon:',
	linkNames: true,
	}).exec({
	// An unexpected error occurred.
	error: function (err){
		console.log("Slack Error:" + err);
	},
	// Specified subdomain and webhook token combination
	notFound: function (){
		console.log("Slack Error:" + err);
	},
	// OK.
	success: function (){

	},
	});
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
