require.config(
    {
        paths: {
            'jquery-ui': 'libs/jquery-ui-1.8.21.custom.min',
            'jquery.jstree': 'libs/jquery.jstree',
            'jquery.rating': 'libs/jquery.rating',
            'jquery.tagsinput': 'libs/jquery.tagsinput.min',
            'moment': 'libs/moment.min',
            'mustache': 'libs/mustache-chrome',
            'oauth-simple': 'libs/oauth-simple',
            'oauth': 'libs/oauth',
            'sha1': 'libs/sha1',
            'underscore': 'libs/underscore-min'
        }

    });
require(['common', 'jquery', 'jquery.tagsinput', 'jquery-ui'], function(common, $) {
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
            occupation_other: $('#occupation_other').val(),
            grade: $('#grade').val(),
            grade_other: $('#grade_other').val(),
            subject: $('#subject').val(),
            tos: $('#tos').val(),
            tos_agreed: !!$('#tos').attr('checked'),
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
            chrome.tabs.getCurrent(function(currentTab) {
                bgPage.oauth.authorize(function(token, token_secret) {
                    bgPage.twitter.fetchUserInfo(function(){
                        restore_twitter();  
                        chrome.tabs.update(currentTab.tabId, {active: true});
                    });
                });
            });
        }
    }

    function deauthorize_twitter() {
        bgPage.logout();
        var bio = common.fetchJSON("bio");
        delete bio.twitter;
        common.putJSON("bio", bio);
        restore_twitter();
    }

    // Restores select box state to saved value from localStorage.
    function restore_oauth() {
        var options = common.fetchJSON("oauth");
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
        var bio = common.fetchJSON("bio");
        if(!bio) {
            return;
        }
        $('#occupation').val(bio.occupation || "");
        $('#occupation_other').val(bio.occupation_other || "");
        $('#grade').val(bio.grade || "");
        $('#grade_other').val(bio.grade_other || "");
        $('#subject').val(bio.subject || "");
        $('#tos').val(bio.tos || "");
        $('#tos').attr("checked", !!bio.tos_agreed?"checked":undefined);
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
            if (!!twit && twit.screen_name) {
                var bio = common.fetchJSON("bio");
                bio.twitter = twit.screen_name;
                common.putJSON("bio", bio);
            }
            setTwitter(twit);     
        } else {
            $('.sign_in_with_twitter').show();
            $(".sign_off_with_twitter").hide();
            setTwitter({});
        }
    }

    function handle_other() {
        $("option[value=other]").parent().bind('change', function(evtData) {
            var self = $(this),
                other = $("#"+self.attr("id")+"_other");

            if (self.val() === "other") {
                other.show(500);
            } else {
                other.hide(500).val("");
            }
        }).change();

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
        handle_other();

        $('input.tags').tagsInput({
            height: '100px',
            width: '500px'
        });
    });
});
