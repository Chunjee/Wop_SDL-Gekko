<!DOCTYPE html>
<html>
    <head>
        <title>CMS Cache Flush Form</title>
        <script src="https://code.jquery.com/jquery-1.11.3.min.js">
        </script>

        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">

        <style type="text/css">
        .container {
            max-width: 50%;
        }

        .glyphicon-upload {
            font-size: 2em;
        }

        #paths-form input.success {
            background: #dff0d8;
        }

        #paths-form input.failure {
            background: #f2dede;
        }

        </style>

        <script>
        url = "/flush_key";

        function add_path_with_value(val) {
            count = $("#paths-form").children().length;
            next = count + 1;
            input = $("<input>").attr("id", "file" + next).attr(
                "type", "text").addClass("form-control").val(val);
            $("#paths-form").append(input);
        }

        function reset() {
                $("#paths-form").empty();
                $("#paths-form").html("<textarea rows='5' cols='60'></textarea>");
                $("#flush-button").show();
        }

        function flush() {
            $("#loading").show();
            $("#flush-button").hide();

            paths = $("#paths-form > textarea").val().split("\n");
            $("#paths-form").empty();

            $(paths).each(function(idx, el) {
                if (el.length > 0) {
                    add_path_with_value(el);
                }
            });


            $("#flush-button").attr("disabled", "");
            requests = [];
            $("#paths-form").children().each(function(idx, el) {
                if ($(el).val().length < 1)
                    return;
                $(el).removeClass("success");
                $(el).removeClass("failure");

                requests.push(
                    $.ajax(
                        url + "?key=" + encodeURIComponent($(el).val()),
                        {
                            'dataType': 'text',
                            'success': function(data, textStatus, jqXHR) {
                                if ($.trim(data) == ":1")
                                    $(el).addClass("success");
                                else {
                                    $(el).addClass("failure");
                                }
                            },
                            'error': function(jqXHR, textStatus, errorThrown) {
                                $(el).addClass("failure");
                            }
                        }
                    )
                );
            });
            $.when.apply($, requests).then(function() {
                $("#flush-button").removeAttr("disabled");
                $("#loading").hide();
            });
        }

        $(document).ready(function() {
            reset();
            $("#flush-button").click(flush);
            $("#reset-button").click(reset);
            $("#loading").hide();
        });
        </script>
    </head>
    <body>
        <div class="container">
            <h1>CMS Cache Flush</h1>

            <div id="loading">
                <div class="alert alert-info" role="alert">
                  <span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>
                  <span class="sr-only">Loading</span>
                  Waiting for flush to complete.
                </div>
            </div>

            <div class="alert alert-info" role="alert">
              <span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>
              <span class="sr-only">Info:</span>
              Type in the paths to flush from cache, one per line (ex. /img/search.png).
            </div>

            <form id="paths-form">
            </form>

            <form class="form-inline">
              <div class="form-group">
                  <button type="button" id="reset-button" class="form-control btn-sm btn-warning">Reset</button>
                  <button type="button" id="flush-button" class="form-control btn-sm btn-primary">Flush</button>
              </div>
            </form>

        </div>

        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    </body>
</html>
