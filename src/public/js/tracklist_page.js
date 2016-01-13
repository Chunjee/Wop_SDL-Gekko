console.log("Tracklist javascript loaded");

//hide div
//$("#tracks").hide();


//send AJAX request
$.get("/api/tracks", "", function(data) {
	//on success, parse and display result
	console.log(data["0"])

	var TrackList = $('ul.tracks_unorderedlist')

	for (var i = 0; i < data["0"].response.cards.length; i++) {
		//For each Track
		var li = $('<li/>')
        .addClass('ui-menu-item')
        .attr('role', 'menuitem')
        .appendTo(TrackList);
    var aaa = $('<a/>')
        .addClass('ui-all')
        .text(data["0"].response.cards[i]["traCode"] + " | MTP: " + data["0"].response.cards[i]["minutesToPost"])
        .appendTo(li);
	};

	/*
	var html = "";
	if (data.length != 0) {
		for (var i = 0; i < data["0"].response.cards.length; i++) {
		//start the html list item
		html += "<li>" + data["0"].response.cards[i]["traCode"];

		//close the html list item
		html += "</li>";
		};
	html += "<br>";
	}
	*/

	

	//replace html and update display
	//$("#tracks").hide();
	//$("#tracks").slideDown("slow");


	$("a.btn").text("Refresh")
});