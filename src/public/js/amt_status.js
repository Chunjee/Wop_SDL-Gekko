console.log("AMT javascript loaded");

//send AJAX request
$.get("/api/amtstatus", "", function(data) {
	//on success, parse and display result
	var html = "";

	//create a var of today as a number string
	var day = new Date();
	day = day.getDate();
	day = day.toString();

	if (data.length != 0) {
		for (var i = 0; i < data.length; i++) {
		//start the html list item
		html += "<li>" + data[i]["name"] + ": " + data[i]["date"];

		//figure out if the days match
		var amtdateREG = data[i]["date"];
		amtdateREG = amtdateREG.match(/0*(\d+)-\w{3}/); //don't capture leading 0 if it exists
		amtdateREG = amtdateREG[1];
		//append to list item accordingly (date matches yes/no)
		if (day === amtdateREG) {
			html += "  <i class='fa fa-check' style='color:green'></i>";
		} else {
			html += "  <i class='fa fa-close' style='color:red'></i>";
		}
		//close the html list item
		html += "</li>";
		};
	html += "<br>";
	}
	

	//replace html and update display
	$("#amts").hide();
	$("#amts").html(html);
	$("#amts").slideDown("slow");
	$("#checkagainbutton").text("Check Again")
});