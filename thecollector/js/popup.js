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
            'underscore': 'libs/underscore-min',
            'core-stds': 'core-stds'
        }
    });
require(['jquery', 'jquery-ui', 'jquery.rating', 'jquery.jstree', 'jquery.tagsinput', 'common', 'lr', 'social', 'others-say', 'state-stds', 'core-stds'], function($) {

    var common = require('common'),
        others = require("others-say"),
        state_stds = require('state-stds'),
        core_stds = require('core-stds'),
        bgPage = chrome.extension.getBackgroundPage();

    $("#tabs").tabs();

    // $("input[name=rating]").rating();

    function check_setup() {
        var oauth = common.fetchJSON("oauth");
        if (!oauth || !(!!oauth.node_url && 
            !!oauth.consumer_key && !!oauth.consumer_secret &&
            !!oauth.token && oauth.token_secret)) {
            var opts = {
                url: chrome.extension.getURL("options.html#tabs-oauth"),
                active: true
            };
            chrome.tabs.create(opts);
            window.close();
            
        }
    }
    check_setup();

    function restore_bio() {
        var bio = common.fetchJSON("bio");
        $('#tos').attr("checked", !!bio && !!bio.tos_agreed?"checked":undefined);
        common.render("must_bio", bio, function(html) {
            $("#bio").html(html);
        });
        console.log(bgPage.twitter.hasUserInfo());
        if (!bio || (!bio.occupation && !bio.occupation_other && 
                !bio.grade && !bio.grade_other && 
                !bio.subject && !bio.twitter)) {
            var opts = {
                url: chrome.extension.getURL("options.html#tabs-about-you"),
                active: true
            };
            chrome.tabs.create(opts);
        }
    }
    restore_bio();

    function restore_twitter() {
        function setTwitter(someTwit) {
            common.render("twitter_user", someTwit, function(html){
                $('#twitter_info').html(html);
                $('#twitter_info').show();
            }); 
        }

        if (bgPage.twitter.hasUserInfo()) {
            // $('.sign_in_with_twitter').hide();
            // $(".sign_off_with_twitter").show();
            bgPage.twitter.fetchUserInfo(function(twit) {
                setTwitter(twit);  
            }, true);
        } else {
            // $('.sign_in_with_twitter').show();
            // $(".sign_off_with_twitter").hide();
            setTwitter({});
        }
    }
    restore_twitter();





    chrome.tabs.getSelected(null, function(curtab) {
        if (curtab.url === curtab.title) {
            $("#tab_title").hide();
        }
        $("#tab_uri").text(curtab.url);
        $("#tab_title").text(curtab.title);
        others.setWhatOthersSay(curtab.url);
    });

    state_stds.init('jurisdiction','state_std', function(stds){
       $("input[name='standardselector']").prop('checked', false)
            .filter("[value='State']").prop('checked',true);

        var big_std = stds,
            grade = $('#grade-level').val(),
            text = $('#state_std :selected').html(),
            std = trimTree(big_std, grade, null);

        cur_std = std;
        numStds = !!std ? std.length : 0;
   
        $('label[for="category-browser"]').text(text);
        if (numStds === 0) {
            $("#category-browser").html('No standard matching selected grade level.').show(500);
        } else {
            $("#category-browser").hide(500).html('<ul id="category-browser-list"></ul>');
            jesco_tree(stds, null);
            $("#category-browser").show(500);
        }
        $("#grade-level").unbind('change');
        $("#grade-level").bind('change', function(evt) {
            var grade = $("#grade-level").val();
            var std = trimTree(big_std, grade, null);
            cur_std = big_std;
            numStds = !!std ? std.length : 0;
            if (numStds === 0) {
                $("#category-browser").hide(500).html('No standard matching selected grade level.').show(500);
            } else {
                $("#category-browser").hide(500).html('<ul id="category-browser-list"></ul>');
                jesco_tree(std, null)
                $("#category-browser").show(500);
            }
        });
        $("div.standards").show(500, function(){ $(".accordion").accordion("resize"); });

    });

    var trimTree = function (tree, grade, ccstd) {
        if (common.isArray(tree)) {
            var trimmed = [];
            for (var i=0; i<tree.length; i++) {
                var val =  trimTree(tree[i], grade, ccstd);
                if (val) {
                    trimmed.push(val);
                }
            }
            if (trimmed.length === 0) {
                trimmed = null;    
            }
            return trimmed;
        } else {
            var trimmed = {};
            var containsGrade = false;
            if (tree.leaf) {
                trimmed.leaf = tree.leaf;
            } else {
                trimmed.leaf = false;
            }
            if (tree.asn_statementNotation) {
                if (!!ccstd)
                    trimmed.ccstd = ccstd;
                trimmed.asn_statementNotation = tree.asn_statementNotation;
            }
            if (tree.text) {
                trimmed.text = $("<div/>").html(tree.text).text();
            }
            if (tree.children) {
                trimmed.children = trimTree(tree.children, grade, ccstd);
                if (!trimmed.children || trimmed.children.length === 0) {
                    trimmed = null;    
                }
            } else {
                if (tree.dcterms_educationLevel) {
                    trimmed.dcterms_educationLevel = [];
                    if (common.isArray(tree.dcterms_educationLevel)) {
                        for (var i=0; i<tree.dcterms_educationLevel.length; i++) {
                            trimmed.dcterms_educationLevel[i] = {
                                prefLabel: tree.dcterms_educationLevel[i].prefLabel
                            };
                            if (!!grade && tree.dcterms_educationLevel[i].prefLabel === grade) {
                                containsGrade = true;
                            }
                        }
                    } else {
                        trimmed.dcterms_educationLevel[0] = {
                            prefLabel: tree.dcterms_educationLevel.prefLabel
                        }
                        if (!!grade && tree.dcterms_educationLevel.prefLabel === grade) {
                            containsGrade = true;
                        }

                    }
                }

                if (tree.id) {
                    trimmed.id = tree.id
                }

                if (!!grade && !containsGrade) {
                    trimmed = null;
                }           

            }
            return trimmed;
        }
    }
    var numStds=0;
    var jesco_tree = function(stds, parent) {
        if (Object.prototype.toString.call([]) === Object.prototype.toString.call(stds)) {
            for (var i=0; i<stds.length; i++) {
                jesco_tree(stds[i], parent);
            }
        } else if (stds) {

            common.render('jesco_node', stds, function(html){

                var child = $(html);
                if (stds.children) {
                    jesco_tree(stds.children, child);
                }
                if (parent) {
                    child.appendTo(parent.find("ul:first"));
                } else {
                    child.appendTo("#category-browser-list");

                    if ($("#category-browser-list > li").length === numStds) {
                        $('#category-browser').bind('loaded.jstree',
                            function() {
                                $(".treeview.hidden").removeClass("hidden");
                                $(".accordion").accordion("resize");
                            })
                            .jstree({
                            "plugins":['themes', 'html_data', 'ui', 'checkbox'],
                            "themes" : {
                                "theme" : "classic",
                                "dots" : true,
                                "icons" : false
                            },
                            "ui": {
                                "select_limit": 0
                            }
                        })
                        .bind("select_node.jstree", function (event, data) {
                            // `data.rslt.obj` is the jquery extended node that was clicked
                            console.log("selected");
                            console.log(data.rslt.obj);
                            var clicked = data.rslt.obj;
                            $("#asn_dot_notation").val(clicked.find(".dotNotation").text());
                            $("#asn_text").val(clicked.find(".statement").text());
                            $("#asn_url").val(clicked.attr("id"));
                        })
                        .bind("check_node.jstree", function (event, data) {
                            console.log("checked");
                            makeStarsForChecked(event, data);
                        })
                        .bind("uncheck_node.jstree", function (event, data) {
                            console.log("unchecked");
                            makeStarsForChecked(event, data);
                        });
                        $(".accordion").accordion("resize");
                    }

                }
            });  


        }
        
    }

    function makeStarsForChecked(event, data) {
        $("div.std-ratings").remove();
        var checkedStandards = $.jstree._reference("#category-browser").get_checked(null, true).filter(".jstree-leaf[id]");

        checkedStandards.each(function(index, elem) {
            var li = $(elem),
            asn = li.attr("id"),
            dot = li.find(".dotNotation").html(),
            stmt = li.find(".statement").html(),
            text = li.find(".text").html(),
            mdata = {
                "asn": dot || "",
                "std_key": stmt || text,
                "std_id": asn 
            };
            
            common.render("must_stars_stds", mdata, function(html){
                var rating = $(html);
                $("div.std-ratings-desc").before(rating);
                rating.find(".align-hover-star").rating({
                    focus: function(value, link) {
                        var parent = $(this).parent();
                        var tip = parent.find(".rating_desc");
                        tip[0].data = tip[0].data || tip.html();
                        tip.html(link.title || value);
                        var full_tip = $(parent.parent()).find("div.description[data-score=\""+value+"\"]");
                        full_tip.removeClass("hidden");
                    },
                    blur: function(value, link){
                        var parent = $(this).parent();
                        var tip = parent.find(".rating_desc");
                        var checked = parent.find("input[type='radio']:checked");
                        if (checked.length > 0) {
                            parent.find(".rating_desc").html(checked[0].title);
                        } else {
                            parent.find(".rating_desc").html(tip[0].data || '');
                        }

                        var full_tip = $(parent.parent()).find("div.description[data-score=\""+value+"\"]");
                        full_tip.addClass("hidden");
                    },
                    callback: function(value, link) {
                        var parent = $(this).parent();
                        var tip = parent.find(".rating_desc");
                        tip[0].data = tip[0].data || tip.html();
                        tip.html(link.title || value);
                    }
                });
                
            });
            // console.log(elem);
        });

    }

    function fetchStandards(selected, data, ccstd, format) {
        var standards=[];
        
        var traverse = function(tree, ccstd) {
            if (common.isArray(tree)) {
                for (var i = 0; i < tree.length; i++) {
                    traverse(tree[i], ccstd);
                }
            } else {
                var trimmed = {};
                if (tree.leaf) {
                    trimmed.leaf = tree.leaf;
                } else {
                    trimmed.leaf = false;
                }
                if (tree.asn_statementNotation) {
                    trimmed.ccstd = ccstd;
                    trimmed.asn_statementNotation = tree.asn_statementNotation;
                }
                if (tree.text) {
                    trimmed.text = $("<div/>").html(tree.text).text();
                }
                if (tree.children) {
                    traverse(tree.children, ccstd);
                } else {
                    if (tree.dcterms_educationLevel) {
                        trimmed.dcterms_educationLevel = [];
                        if (common.isArray(tree.dcterms_educationLevel)) {
                            for (var i = 0; i < tree.dcterms_educationLevel.length; i++) {
                                trimmed.dcterms_educationLevel[i] = {
                                    prefLabel: tree.dcterms_educationLevel[i].prefLabel
                                };
                            }
                        } else {
                            trimmed.dcterms_educationLevel[0] = {
                                prefLabel: tree.dcterms_educationLevel.prefLabel
                            }

                        }
                    }

                    if (tree.id && selected[tree.id]) {
                        trimmed.id = tree.id;

                        if (format) {
                            standards.push(format(trimmed));
                        } else {
                            standards.push(trimmed);
                        }
                    }

                }
            }
        }

        traverse(data, ccstd);
        return standards;
    }

    var stds_cache = {};
    function getStd(name, cb) {
        var std_info = core_stds.map[name],
            xhr = common.ajax('GET', chrome.extension.getURL('js/'+std_info.manifest));
            xhr.done(cb);
    }

    




    


    var cur_std = null;
    var cur_ccstd = null;
    $('input[name="standardselector"][data="core"]').bind("change", function(evt) {
        var selected = $(evt.target).val();
        var text = $('label[for="'+selected+'"]').text();
        if (selected) {
            cur_ccstd = selected;
            getStd(selected, function (big_std){
                var std = trimTree(big_std, $('#grade-level').val(), selected);
                cur_std = big_std;
                numStds = std.length;
                $('label[for="category-browser"]').text(text);
                $("#category-browser").hide(500).html('<ul id="category-browser-list"></ul>');
                jesco_tree(std, null);
                $("#category-browser").show(500);
                $("#grade-level").unbind('change');
                $("#grade-level").bind('change', function(evt) {
                    var grade = $("#grade-level").val();
                    var std = trimTree(big_std, grade, selected);
                    cur_std = big_std;
                    numStds = std.length;
                    $("#category-browser").hide(500).html('<ul id="category-browser-list"></ul>');
                    jesco_tree(std, null);
                    $("#category-browser").show(500);
                });
                $("div.standards").show(500, function(){ $(".accordion").accordion("resize"); });
            });

        } else {
            $("div.standards").hide(500, function(){ $(".accordion").accordion("resize"); });
            $('label[for="category-browser"]').empty();
            $("#category-browser").html('<ul id="category-browser-list"></ul>');
        }
    });

    $(".hover-star").rating({
        focus: function(value, link) {
            var parent = $(this).parent();
            var tip = parent.find(".rating_desc");
            tip[0].data = tip[0].data || tip.html();
            tip.html(link.title || value);
            var full_tip = parent.find("div.description[data-score=\""+value+"\"]");
            full_tip.removeClass("hidden");
        },
        blur: function(value, link){
            var parent = $(this).parent();
            var tip = parent.find(".rating_desc");
            var checked = parent.find("input[type='radio']:checked");
            if (checked.length > 0) {
                parent.find(".rating_desc").html(checked[0].title);
            } else {
                parent.find(".rating_desc").html(tip[0].data || '');
            }

            var full_tip = parent.find("div.description[data-score=\""+value+"\"]");
            full_tip.addClass("hidden");
        },
        callback: function(value, link) {
            var parent = $(this).parent();
            var tip = parent.find(".rating_desc");
            tip[0].data = tip[0].data || tip.html();
            tip.html(link.title || value);
        }
    });

    

    $(".accordion").accordion({ icons: false, clearStyle: true, autoHeight: false, 
        change: function(event, ui){
                ui.newHeader[0].scrollIntoView();
        }});



    var lr = require("lr");

    $("input#tos").bind('change', function(evt) {
        var self = $(this);
        if (!!self.attr("checked")) {
            $("#submit_to_lr").removeAttr("disabled");
        } else {
            $("#submit_to_lr").attr("disabled", "disabled");
        }
    }).change();

    function getJurisdictionAndStandard() {
        var std = $("input[name='standardselector']:checked").val(),
            info = {
                jurisdiction: null,
                standard: null
            };

        if (std === "State") {
            var juris = $("select#jurisdiction :selected").text(),
                st_std = $("select#state_std :selected").text();
            info.jurisdiction = juris;
            info.standard = st_std;

        } else {
            info.jurisdiction = "Common Core State Standards";
            if (std === "Math")
                info.standard = "Common Core State Standards for Mathematics";
            else if (std === "Literacy") {
                info.standard = "Common Core State Standards for English Language Arts & Literacy in History/Social Studies, Science, and Technical Subjects";
            }
        }

        return info;

    }

    $("#submit_to_lr").bind('click', function (evt) {
        var checkedStandards = $.jstree._reference("#category-browser").get_checked(null, true).filter(".jstree-leaf[id]");
        var ratedStandards = $("input[type=radio].align-hover-star:checked");
        var ratings = $("input[type=radio].hover-star:checked");
        
        if ((checkedStandards.length > 0 ||
            ratedStandards.length > 0 || 
            ratings.length == 6) && 
            !!$("#tos").attr("checked")) {

            var info = {
                resource_title: $("#tab_title").text(),
                resource_url: $("#tab_uri").text(),
                standards: { },
                ratings: { },
                tos: {
                    submission_TOS: $("#tos").val()
                },
                tags: $("#tags").val(),
                comment: $("#comment").val()
            }

            

            var standards = {};
            $.map(checkedStandards, function(val, i){
                var asn_url = val.id;
                if (!!asn_url) {
                    standards[asn_url] = 1;
                }
            });

            var standards_info = getJurisdictionAndStandard();
            info.standards = fetchStandards(standards, cur_std, cur_ccstd, function (std) {
                var s =  {
                    dot_notation: std.ccstd ? std.ccstd+"."+std.asn_statementNotation : std.asn_statementNotation,
                    text: std.text,
                    url: std.id,
                    grade_level: std.dcterms_educationLevel,
                    jurisdiction: standards_info.jurisdiction,
                    standard: standards_info.standard
                }


                var rating = $("input[type=radio][data-asn='"+std.id+"'].align-hover-star:checked");
                if (rating.length > 0) {
                    s.rating = {
                        rubric: "rubric1",
                        value: rating.val()
                    }
                } 

                return s;
            });

            ratings.each(function(idx, e){
                info.ratings[e.name] = parseInt(e.value);
            });

            var xhr = lr.submitToLR(info);

            xhr.done(function(msg) {
                if (msg.OK === true) {
                    var id = "status_"+ (new Date()).getTime();
                    $('<span id="'+id+'">Success!!! Thank You!</span>').appendTo("#status_msg");
                    setTimeout(function() {
                        $('#'+id).hide(500);
                        $('#status_msg').remove('#'+id);
                    }, 750);
                }
            });

            console.log(info);

        } else {
            // console.log($("#asn_dot_notation").val());
            // console.log($("#asn_text").val());
            // console.log($("#asn_url").val());
            // console.log($("input.hover-star:checked"));
        }

    });

    $('#tags').tagsInput({
        height: '100px',
        width: '454px'
    });

    

    $("#comment").keydown(function(event, obj){
        var self = $(this);
        $("div.comment_chars").html((self.attr("maxlength") - self.val().length)+" characters remaining.");
    }).keydown();

    $('button.next').click(function(evt, obj){
        var self = $(this);
        $(".accordion").accordion("activate", parseInt(self.attr("data")));
    });


});