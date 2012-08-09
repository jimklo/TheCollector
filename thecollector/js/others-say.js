define(["common", "jquery", "pie", "rubric"],function(common, $, pie, rubric){

    function render_title() {
        return function(text, render) {
            var t = render(text);
            for (var i in rubric) {
                if (rubric[i].rubric === t) {
                    t = rubric[i].title;
                    break;
                }
            }
            return t;
        }
    }

    function not_common_core() {
        return function(text, render) {
            var t = render(text);
            if (t.match(/Common Core State Standards/i)) {
                return "";
            } else {
                return t;
            }
        }
    }

    function setWhatOthersSay(url) {
        var data = common.fetchJSON(url);
        if (!!data) {
            // common.render('must_social_stds', data, function(html){
            //     $("#what-others-say .socialstds").html(html);
            // });

            data.rtitle = render_title;
            data.notcc = not_common_core;
            common.render('must_social_rubrics', data, function(html){
                $("#what-others-say .socialrubric").html(html);
                pie.draw();
            });

            $("#tabs").tabs("option", "disabled", []);
        } else {
            $("#tabs").tabs("option", "disabled", [1]);
        }
    }


    return {
        setWhatOthersSay: setWhatOthersSay
    }

});