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
/*
var jsdom = require('jsdom');
jsdom.env(
  "https://iojs.org/dist/",
  ["http://code.jquery.com/jquery.js"],
  function (err, window) {
    //console.log("there have been", window.$("a").length - 4, "io.js releases!");
    //var $ = window.$;
  }
);
*/
//var $ = require('jquery');


	//Promises
var Promise = require('bluebird');
	//request
var request = require('request');
	//Tail
var Tail = require('tail-forever');
	//Slack
var Slack = require('machinepack-slack');
	//Moment
var moment = require('moment');

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


//Localized options
	//Colors
var colors = require('colors');
	//Sounds

//var player = require('play-sound-v12'); //(opts = {})
//var play = require('play').Play();
var MPlayer = require('mplayer');

//Set Template Engine
app.set('view engine', 'jade');
app.set('views', __dirname + '/templates');


///--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// PREP AND STARTUP
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/
console.log("Started on " + Date());
var The_Date = Fn_SetDate();
//setInterval(Fn_SetDate, 1000*60*60);

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
		},
		{
		"name": "tvgvpramt07",
		"date": ""
		},
		{
		"name": "tvgvpramt08",
		"date": ""
		}
	];
var alltracks = "";
//setInterval(checkSDL, 1000*60*5); //re-index the SGR every 5 mins


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

var port = 1333;
app.listen(port, function() {
	console.log("The frontend server is running on port " + port);
});

///--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// MAIN
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/

var AmToteSDL = new SDL_class("alf", "location");
//AmToteSDL.pull_file();



///--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\
// Function Staging
//\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/--\--/

//Start tailing the SDL File
var datestring = moment().format('YYYY-MM-DD');
tailfile(moment().format('YYYY-MM-DD'));
//tailfile("2016-10-03");
fn_AudioAlert("sobeautiful.mp3");


function tailfile(para_date) {
  var filelocation = "\\\\tvgvprmsg02\\tvg\\LogFiles\\MessageBroker_" + para_date + ".log"
  var tail = new Tail(filelocation,{});
  console.log("listening to today's messagebroker file at: " + filelocation);

  //for each new message
  tail.on("line", function(line) {
  	var Message_Obj = MessageSeverityGutCheck(line);
  	//only send messages to the slack if they are FATAL or SEVERE
	//WARNING and INFORMATIONAL make sound depending on circumstance
	//1-FATAL  2-SEVERE  3-WARNING  4-INFORMATIONAL  5-USELESS  0-NOT DEFINED
  	if (Message_Obj.Severity == 1) { //FATAL
  		console.log(colors.red.underline(Message_Obj.Server + "-" + Message_Obj.Service + ": " + Message_Obj.Message));
  		SlackPost(Message_Obj.Server + "-" + Message_Obj.Service + ": " + Message_Obj.Message);
		fn_AudioAlert();
  	}
    if (Message_Obj.Severity == 2) { //SEVERE
  		console.log(colors.red(Message_Obj.Server + "-" + Message_Obj.Service + ": " + Message_Obj.Message));
  		SlackPost(Message_Obj.Server + "-" + Message_Obj.Service + ": " + Message_Obj.Message);
		fn_AudioAlert();
  	}
  	if (Message_Obj.Severity == 3) { //WARNING
  		console.log(colors.yellow(Message_Obj.Server + "-" + Message_Obj.Service + ": " + Message_Obj.Message));
		fn_AudioAlert();
  	}
	if (Message_Obj.Severity == 4) { //INFORMATIONAL
  		console.log(colors.green(Message_Obj.Server + "-" + Message_Obj.Service + ": " + Message_Obj.Message));
  	}
	if (Message_Obj.Severity == 5) { //USELESS
  		//Nothing
  	}
	//not sorted, research and catalog
    if (Message_Obj.Severity == 0) {
  		console.log(colors.gray(Message_Obj.Server + "-" + Message_Obj.Service + ": " + Message_Obj.Message));
  	}
  });
  tail.on("error", function(error) {
    console.log('ERROR with MessageBroker file: ' + error, error);
    tail
  });
}







function MessageSeverityGutCheck(para_Input) {
//checks incomming messages against our list of severity
//1-FATAL  2-SEVERE  3-WARNING  4-INFORMATIONAL  5-USELESS  0-NOT DEFINED
//[0]Index  [1]SERVER  [2]SERVICE  [3]DENVER-SEVERITY  [4]???BLANK???  [5]DATE TIME  [6]!CODE! [7]RAW-MESSAGE
	var Output_Obj = [];
	Output_Obj.Severity = 0;
	Output_Obj.RawMessage = para_Input;

	//discard 

	//Separate information out
	var Message_array = fn_Splitfile(para_Input + "|", "|");
	if (Message_array.length == 9) {
		Output_Obj.Index = parseFloat(Message_array[0].replace(/ /g,''));
		Output_Obj.Server = Message_array[1].replace(/ /g,'');
		Output_Obj.Service = Message_array[2].replace(/ /g,'');
		Output_Obj.DenverSeverity = Message_array[3].replace(/ /g,'');
		//Output_Obj.??? = Message_array[4];
		Output_Obj.DateString = Message_array[5];
		Output_Obj.DenverCode = parseFloat(Message_array[6].replace(/ /g,''));
		Output_Obj.Message = Message_array[7];
	} else {
		console.log(para_Input);
		Output_Obj.Severity = 0;
		Output_Obj.Server = "NONE";
		Output_Obj.UserMessage = "Unhandled Error, does not follow normal error message formatting";
		Output_Obj.Message = para_Input;
		return Output_Obj;
	}
	
	//Start with default documentation
	Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";

	//1 - Fatal; sites are totally down or impacting some percentage of wagers
	Output_Obj.Severity = 1;
	if (InStr(Output_Obj.Message,"may have hung")) {
		Output_Obj.UserMessage = "DataService needs to be checked";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Fatal";
	}
  	if (InStr(Output_Obj.Message,"Window NoTote")) {
		Output_Obj.UserMessage = "Tote Windows possibly down";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/RC+-33+error+message+on+DDS+TIP+down+procedures";
	}
	if (Output_Obj.UserMessage) {
		return Output_Obj;
	}
	//End of Fatal


	//2 - Severe; errors impact the customer and should be solved as soon as possible
	Output_Obj.Severity = 2;
	if (InStr(Output_Obj.Message,"Could not find server")) {
		Output_Obj.UserMessage = "DBA issue";
	}
	if (InStr(Output_Obj.Message,"Dialogic")) {
		Output_Obj.UserMessage = "IVR has missing pool or other Dialogic error";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/IVR+Dialogic+Error";
	}
	if (InStr(Output_Obj.Message,"Communications failures")) {
		Output_Obj.UserMessage = "Communications failures exceed WindowNotToteLimit, Tote might be down";
	}
	if (Output_Obj.UserMessage) {
		return Output_Obj;
	}
	//End of Severe


	//3 - Warnings; require some action be taken at some point, but have little to no impact
	//also things that if constantly repeating, should be looked at
	Output_Obj.Severity = 3;
	if (InStr(Output_Obj.Message,"Truncation errors")) {
		Output_Obj.UserMessage = "please start the log service at your convenience";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/String+Data+Right+Truncation+errors+on+DDS";
	}
	if (InStr(Output_Obj.Message,"Finisher data contains shared betting interest:")) {
		Output_Obj.UserMessage = "Coupled Entry just placed in a race";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Warning";
		fn_AudioAlert("couple-sandwiches.wav");
	}
	if (InStr(Output_Obj.Message,"Error getting account balance")) {
		Output_Obj.UserMessage = "Error getting account balance";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/RC+-33+error+message+on+DDS+TIP+down+procedures";
	}
	if (InStr(Output_Obj.Message,"RPC server is unavailable")) {
		Output_Obj.UserMessage = "Restart the effected server";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/RPC+server+is+unavailable";
	}
	if (Output_Obj.UserMessage) {
		return Output_Obj;
	}
	//End of Warnings


	//4 - Informational; totally normal operational messages that might be interesting
	Output_Obj.Severity = 4;
	if (InStr(Output_Obj.Message,"Betting Intrest")) {
		Output_Obj.UserMessage = "Coupled Entry Finisher" + Output_Obj.Message;
	}
	if (Output_Obj.UserMessage) {
		return Output_Obj;
	}
	//End of Informational


	//5 - Useless; totally normal operational messages, do not bother console with these
	Output_Obj.Severity = 5;
	if (InStr(Output_Obj.Message,"Payment type not bound")) {
		Output_Obj.UserMessage = "everything is good";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"Update Race where")) {
		Output_Obj.UserMessage = "X track with Y abbreviation for Z day has an invalid time format";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Invalid+Time+Format+Error";
	}
	if (InStr(Output_Obj.Message,"Error in Automated Bet Reviewer")) {
		Output_Obj.UserMessage = "???";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
  	if (InStr(Output_Obj.Message,"Error in AutomatedBetReviewer")) {
    	Output_Obj.UserMessage = "???";
    	Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"Results  are  final")) { //for some reason they had two spaces
		Output_Obj.UserMessage = "Race just went official";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"unreconciled bets selected")) {
		Output_Obj.UserMessage = "BOP is working on reconciling bets";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"Opening new account")) {
		Output_Obj.UserMessage = "new account created";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"Creating tote account")) {
		Output_Obj.UserMessage = "Customers account was created at Tote";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"A horse was scratched")) {
		Output_Obj.UserMessage = "A horse was scratched";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"A horse was livened")) {
		Output_Obj.UserMessage = "A horse was livened";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"The race has closed")) {
		Output_Obj.UserMessage = "A race just closed";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"Data has been parsed for Track")) {
		Output_Obj.UserMessage = "track is not available via Gateway; typically OK"; //might need more research on this one
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"now available via the SGRGateway")) {
		Output_Obj.UserMessage = "Track just became available over the SGRGateway";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"Message Monitor")) {
		Output_Obj.UserMessage = "Someone has connected to the messagebroker with messagemonitor";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"ThreadStart()")) {
		Output_Obj.UserMessage = "a new thread entered from the DataCollector";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"TMS starting up")) {
		Output_Obj.UserMessage = "TMS is starting";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"Track Abbreviation not found")) {
		Output_Obj.UserMessage = "Track not found in"; //usually fine
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"The callback connection to")) {
		Output_Obj.UserMessage = "callback exception has ended";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
	if (InStr(Output_Obj.Message,"EINVALIDPIN")) {
		Output_Obj.UserMessage = "User input wrong PIN";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational";
	}
  	if (InStr(Output_Obj.Message,"is now responding")) {
		Output_Obj.UserMessage = "something is reponding again";
		Output_Obj.documentation = "The DatabaseQueue thread of [X]-DdsControl (Id = 8fc) is now responding.";
	}
	if (Output_Obj.UserMessage) {
		return Output_Obj;
	}
	//End of Useless



  //----------------------TEMP----------------------
  //These errors CAN indicate a problem but occur with such frequency that is is hard to detimine if an actual issue is occuring
  if (InStr(Output_Obj.Message,"Communication failure for track")) {
		Output_Obj.UserMessage = "TEMP";
		Output_Obj.documentation = "TEMP";
	}
  if (InStr(Output_Obj.Message,"a DdsEvents callback system has been created on")) {
		Output_Obj.UserMessage = "TEMP";
		Output_Obj.documentation = "TEMP";
	}
  if (InStr(Output_Obj.Message,"The remote procedure call failed")) {
		Output_Obj.UserMessage = "TEMP";
		Output_Obj.documentation = "TEMP";
	}
  if (InStr(Output_Obj.Message,"is not responding")) {
		Output_Obj.UserMessage = "TEMP";
		Output_Obj.documentation = "TEMP";
	}


	//if this messagetype has never been encountered
	if (Output_Obj.UserMessage) {
		Output_Obj.Severity = 5;
		Output_Obj.Message = "unhandled message type:" + Output_Obj.RawMessage;
	}
	//give back the Output_Obj
	return Output_Obj;
} //End of GutCheck


function MessageSeverity(para_Input) {
	//This concept failed because Denver did not differenciate different error codes
	//Sample: SendMsg(2, Warning, "Exception caught in CSGRTransaction::GetSessionNumber() location: %s", location);
	//[0]Index  [1]SERVER  [2]SERVICE  [3]DENVER-SEVERITY  [4]???BLANK???  [5]DATE TIME  [6]!CODE! [7]RAW-MESSAGE
	var Message_array = fn_Splitfile(para_Input, "|");
	Output_Obj.DenverCode = parseFloat(Message_array[6].replace(/ /g,''));
	/*
	switch (message_l) {
    case 1:
        //day = "Monday";
        break;
	case 118:
        //day = "Monday";
        break;
	//4 - Informational; totally normal operational messages
	case 1111:
		console.log("case 1111 encountered")
        break;
	} //end of switch
	*/
	return Output_Obj;
}


function fn_Splitfile(para_input, para_delimiter) {
  //takes a string, returns array separated by para_delimiter
  para_input = "" + para_input;
  var res = para_input.split(para_delimiter);
  return res;
};


function InStr(para_String, para_needle) {
	var Output = para_String.indexOf(para_needle);
	if (Output === -1) {
		return 0;
	} else {
		return 1;
	}
}


function fn_AudioAlert(para_Input = false) {
var player = new MPlayer();
	if (para_Input == false) {
		player.openFile("./src/sounds/alarm.wav");
	} else {
		player.openFile("./src/sounds/"+ para_Input);
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
	webhookUrl: 'https://hooks.slack.com/services/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',
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



function Fn_SetDate() {
	var Datetime = require('machinepack-datetime');

	// Convert a JS timestamp and timezone into a human readable date/time.
	Datetime.format({
	timezone: 'America/los_angeles',
	formatString: 'YYYY-MM-DD', //2016-01-25
	}).exec({
	// An unexpected error occurred.
	error: function (err){
	},
	// Unrecognized timezone.
	unknownTimezone: function (){
	},
	// Could not build a date/time/zone from the provided timestamp.
	invalidDatetime: function (){
	},
	// OK.
	success: function (result){
	The_Date = result;
	console.log(result);
	return result;
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
