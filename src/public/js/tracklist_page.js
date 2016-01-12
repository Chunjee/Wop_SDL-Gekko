console.log("Tracklist javascript loaded");

//send AJAX request
$.get("/api/tracks", "", function(data) {
	//on success, parse and display result
	console.log(data["0"])

	//create a var of today as a number string
	var day = new Date();
	day = day.getDate();
	day = day.toString();

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
	

	//replace html and update display
	$("#tracks").hide();
	$("#tracks").html(html);
	$("#tracks").slideDown("slow");
	$("#checkagainbutton").text("Check Again")
});