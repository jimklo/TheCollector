
require(['jquery', 'jquery-ui-1.8.21.custom.min'], function($) {

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

    $(function(){
        $("#tabs").tabs();
        $(".save_oauth").bind('click', save_oauth);
        $(".save_bio").bind('click', save_bio);
        restore_oauth();
        restore_bio();
    });
});
