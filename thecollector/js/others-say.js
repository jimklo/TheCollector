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

    function setWhatOthersSay(url) {
        var data = common.fetchJSON(url);
        
        common.render('must_social_stds', data, function(html){
            $("#what-others-say .socialstds").html(html);
        });

        data.rtitle = render_title;
        common.render('must_social_rubrics', data, function(html){
            $("#what-others-say .socialrubric").html(html);
            pie.draw();
        });
    }


    return {
        setWhatOthersSay: setWhatOthersSay
    }

});