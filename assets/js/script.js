// Configuration parapmeters
var endPoint = "/api/apps/create",
    requestbase = "http://request-applait.rhcloud.com",
    appId,
    appurl,
    manifesturl;

//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('.page-scroll a').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Handle app-request with AJAX
var youGoBoy = function (appname, appdescription, url) {
    $.ajax({
        type: "POST",
        url: endPoint,
        data: {
            name: appname,
            description: appdescription,
            url: url
        }
    }).done(function (data) {
        appId = data.appId;
        appurl = "/apps/" + appId;
        manifesturl = "/api/apps/" + appId + "?prettyprint=true";
        $("#submission-toast").html($("#submission-toast").html()
                .replace(/\{appurl\}/, appurl)
                .replace(/\{manifesturl\}/, manifesturl))
            .fadeIn();
        $("#generator-form").remove();

        $("#request-submit").click( function (event) {
            event.preventDefault();
            var email = $("#item-email").val().trim();
            if (email && /\w+\@\w+\.\w+/.test(email)) {
                $.ajax({
                    type: "POST",
                    url: requestbase,
                    data: {
                        email: email,
                        appId: appId
                    }
                }).done(function (data) {
                    $("#request-form").remove();
                    $("#request-success").removeClass("hidden");
                });
            } else {
                $("#item-email").select();
            }
            return false;
        });

    }).fail(function (error) {
        console.log(JSON.stringify(error, null, "  "));
    });
};

var ohNoes = function () {
    $("#failure-toast").fadeIn();
    $("#generator-form").hide();
}

$("#generator-submit").click( function (event) {
    event.preventDefault();
    var appname = $("#item-app-name").val();
    var appdescription = $("#item-app-description").val();
    var url = $("#item-url").val();
    (appname && appdescription && url) ? youGoBoy(appname, appdescription, url) : ohNoes();
    return false;
});



// Reenable form, for resubmission
$(".request-again").click( function (event) {
    $(this).parent().hide();
    $("#generator-form").fadeIn();
    $("#item-app-name").select();
});
