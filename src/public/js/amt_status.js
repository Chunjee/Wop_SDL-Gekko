console.log("status javascript loaded");
$("#checkagainbutton").hide();
//$( "#amts" ).css( "border", "3px solid red" );
$.get("/api/amtstatus", "", function(data) {
	var html = "";
	for (var i = 0; i < data.length; i++) {
		html += "<li>"  + data[i]["name"] + ": " + data[i]["date"] + "</li>";
	};

	$("#amts").replaceWith(html);
	$("#amts").delay(1000).show();
});
$("#checkagainbutton").delay(1000).show();