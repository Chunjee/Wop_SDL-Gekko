console.log("Tracklist javascript loaded");

//hide div
//$("#tracks").hide();


//send AJAX request
$.get("/api/tracks", "", function(data) {
	//on success, parse and display result
		//console.log(data["0"])

	var TrackList = $('ul.tracks_unorderedlist')
	var Obj_Tracks = [];
	for (var i = 0; i < data["0"].response.cards.length; i++) {
		//For each Track
		var li = $('<div/>')
        .addClass('ui-menu-item')
        .addClass('track-' + data["0"].response.cards[i]["traCode"])
        .attr('role', 'menuitem')
        .text(data["0"].response.cards[i]["traCode"] + " | MTP: " 
        	+ data["0"].response.cards[i]["minutesToPost"] + " | Race: " 
        	+ data["0"].response.cards[i]["currentRaceNumber"] 
        	+ "/" + data["0"].response.cards[i]["maxRaceNumber"])
        .appendTo(TrackList)
        .on( "click", function() {
			console.log($(this).text());
			//Show each race which is .hide() by default
			$(this.children).toggle("slow");
		});


		//append all races to THIS
		this.RacesArray = data["0"].response.cards[i]["races"];
		//for each race at the track
		for (var index = 0; index < this.RacesArray.length; index++) {
			var race_humanreadable = index +1;
			var race = $('<li/>')
			.addClass('race-item')
			.hide() //hide by default
			.text(race_humanreadable)
			.appendTo(li);
		}
		

		if (data["0"].response.cards[i]["currentRaceNumber"] === data["0"].response.cards[i]["maxRaceNumber"]) {
			li.attr("complete", true);
		}
	//var aaa = $('<a/>')
	//    .addClass('ui-all')
	//    .text(data["0"].response.cards[i]["traCode"] + " | MTP: " + data["0"].response.cards[i]["minutesToPost"] + " | Race: " + data["0"].response.cards[i]["currentRaceNumber"] + "/" + data["0"].response.cards[i]["maxRaceNumber"])
	//    .appendTo(li);
	};



	
	/*
	var html = "<table id='table_id' class='display>";
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
	

    	
	//var htmltest = '<table id="table_id" class="display"><thead><tr><th>Column 1</th><th>Column 2</th></tr></thead><tbody><tr><td>Row 1 Data 1</td><td>Row 1 Data 2</td></tr><tr><td>Row 2 Data 1</td><td>Row 2 Data 2</td></tr></tbody></table>';

	//replace html and update display
	//$("#tracks").html(htmltest);
	$('#table_id').DataTable();
	//$("#tracks").hide();
	$("#tracks").slideDown("slow");


	$("a.btn").text("Refresh")
});