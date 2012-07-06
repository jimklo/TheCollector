
require(['common', 'jquery', 'jquery-ui-1.8.21.custom.min'], function(common, $) {
    var common = require('common');
    var bgPage = chrome.extension.getBackgroundPage();

    // Saves options to localStorage.
    function save_oauth() {

        var options = {
            node_url: $('#node_url').val(),
            consumer_key: $('#consumer_key').val(),
            consumer_secret: $('#consumer_secret').val(),
            token: $('#token').val(),
            token_secret: $('#token_secret').val()
        };

        localStorage["oauth"] = JSON.stringify(options);
        // Update status to let user know options were saved.
        var id = "status_"+ (new Date()).getTime();
        $("#status").html('<div id="'+id+'">Options Saved.</div>');
        setTimeout(function() {
            $('#'+id).hide(500);
            $('#status').remove('#'+id);
        }, 750);
    }

    function save_bio() {
        var bio = {
            occupation: $('#occupation').val(),
            grade: $('#grade').val(),
            subject: $('#subject').val(),
            tos: $('#tos').val(),
            tos_attribution: $('#tos_attribution').val(),
            twitter: $('#twitter').val()
        };

        localStorage["bio"] = JSON.stringify(bio);
        // Update status to let user know options were saved.
        var id = "status_"+ (new Date()).getTime();
        $("#status").html('<div id="'+id+'">Options Saved.</div>');
        setTimeout(function() {
            $('#'+id).hide(500);
            $('#status').remove('#'+id);
        }, 750);
    }

    function authorize_twitter() {
        if (bgPage.twitter.hasUserInfo()) {
            restore_twitter();
        } else {
            bgPage.oauth.authorize(function(token, token_secret) {
                bgPage.twitter.fetchUserInfo(function(){
                    restore_twitter();   
                });
            });
        }
    }

    function deauthorize_twitter() {
        bgPage.logout();
        restore_twitter();
    }

    // Restores select box state to saved value from localStorage.
    function restore_oauth() {
        var options = JSON.parse(localStorage["oauth"]);
        if (!options) {
            return;
        }
        $('#node_url').val(options.node_url || "");
        $('#consumer_key').val(options.consumer_key || "");
        $('#consumer_secret').val(options.consumer_secret || "");
        $('#token').val(options.token || "");
        $('#token_secret').val(options.token_secret || "");

    }

    function restore_bio() {
        var bio = JSON.parse(localStorage["bio"]);
        if(!bio) {
            return;
        }
        $('#occupation').val(bio.occupation || "");
        $('#grade').val(bio.grade || "");
        $('#subject').val(bio.subject || "");
        $('#tos').val(bio.tos || "");
        $('#tos_attribution').val(bio.tos_attribution || "");
        $('#twitter').val(bio.twitter || "");
    }

    function restore_twitter() {
        function setTwitter(someTwit) {
            common.render("twitter_user", someTwit, function(html){
                $('#twitter_info').html(html);
                $('#twitter_info').show();
            }); 
        }

        if (bgPage.twitter.hasUserInfo()) {
            $('.sign_in_with_twitter').hide();
            $(".sign_off_with_twitter").show();
            var twit = bgPage.twitter.getUserInfo();
            setTwitter(twit);     
        } else {
            $('.sign_in_with_twitter').show();
            $(".sign_off_with_twitter").hide();
            setTwitter({});
        }
    }




    $(function(){
        $("#tabs").tabs();
        $(".save_oauth").bind('click', save_oauth);
        $(".save_bio").bind('click', save_bio);
        $(".sign_in_with_twitter").bind('click', authorize_twitter);
        $(".sign_off_with_twitter").bind('click', deauthorize_twitter);

        restore_oauth();
        restore_bio();
        restore_twitter();
    });
});
