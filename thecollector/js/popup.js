require.config(
    {
        paths: {
            'underscore': 'underscore-min',
            'jquery-ui': 'jquery-ui-1.8.21.custom.min',
            'jquery.rating': 'jquery.rating.pack',
            'moment': 'moment.min',
            'Math': 'mcc',
            'Literacy': 'ecc',
            'raphael': 'raphael-min'
        }
    });
require(['jquery', 'jquery-ui', 'jquery.rating', 'jquery.jstree', 'common', 'Math', 'Literacy', 'lr', 'social', 'others-say'], function($) {

    var common = require('common');
    var others = require("others-say");

    $("#tabs").tabs();

    // $("input[name=rating]").rating();


    chrome.tabs.getSelected(null, function(curtab) {
        if (curtab.url === curtab.title) {
            $("#tab_title").hide();
        }
        $("#tab_uri").text(curtab.url);
        $("#tab_title").text(curtab.title);
        others.setWhatOthersSay(curtab.url);
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
                            if (tree.dcterms_educationLevel[i].prefLabel === grade) {
                                containsGrade = true;
                            }
                        }
                    } else {
                        trimmed.dcterms_educationLevel[0] = {
                            prefLabel: tree.dcterms_educationLevel.prefLabel
                        }
                        if (tree.dcterms_educationLevel.prefLabel === grade) {
                            containsGrade = true;
                        }

                    }
                }

                if (tree.id) {
                    trimmed.id = tree.id
                }

                if (!containsGrade) {
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
                                "select_limit": 1
                            }
                        })
                        .bind("select_node.jstree", function (event, data) {
                            // `data.rslt.obj` is the jquery extended node that was clicked
                            console.log(data.rslt.obj);
                            var clicked = data.rslt.obj;
                            $("#asn_dot_notation").val(clicked.find(".dotNotation").text());
                            $("#asn_text").val(clicked.find(".statement").text());
                            $("#asn_url").val(clicked.attr("id"));
                        });
                        $(".accordion").accordion("resize");
                    }

                }
            });  


        }
        
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
    function getStd(name) {
        if (!stds_cache[name]) {
            stds_cache[name] = require(name);
        }
        return stds_cache[name];
    }

    var cur_std = null;
    var cur_ccstd = null;
    $('input[name="standardselector"]').bind("change", function(evt) {
        var selected = $(evt.target).val();
        var text = $('label[for="'+selected+'"]').text();
        if (selected) {
            cur_ccstd = selected;
            var big_std = getStd(selected);
            var std = trimTree(big_std, $('#grade-level').val(), selected);
            cur_std = big_std;
            numStds = std.length;
            $('label[for="category-browser"]').text(text);
            $("#category-browser").html('<ul id="category-browser-list"></ul>');
            jesco_tree(std, null);
            $("#grade-level").unbind('change');
            $("#grade-level").bind('change', function(evt) {
                var grade = $("#grade-level").val();
                var std = trimTree(big_std, grade, selected);
                cur_std = big_std;
                numStds = std.length;
                $("#category-browser").html('<ul id="category-browser-list"></ul>');
                jesco_tree(std, null)
            });
            $("div.standards").show(500, function(){ $(".accordion").accordion("resize"); });

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
            parent.find(".rating_desc").html(tip[0].data || '');

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

    $(".accordion").accordion({ icons: false, clearStyle: true, autoHeight: false });

    var lr = require("lr");


    $("#submit_to_lr").bind('click', function (evt) {
        var checkedStandards = $('#category-browser').jstree('get_checked').find('.jstree-leaf[id]');

        if (checkedStandards.length > 0 &&
            $("#tos").val() &&
            $("input.hover-star:checked").length == 6) {

            var info = {
                resource_title: $("#tab_title").text(),
                resource_url: $("#tab_uri").text(),
                standards: { },
                ratings: { },
                tos: {
                    submission_TOS: $("#tos").val()
                }
            }

            var standards = {};
            $.map(checkedStandards, function(val, i){
                var asn_url = val.id;
                if (!!asn_url) {
                    standards[asn_url] = 1;
                }
            });

            info.standards = fetchStandards(standards, cur_std, cur_ccstd, function (std) {
                return {
                    dot_notation: std.ccstd + "." + std.asn_statementNotation,
                    text: std.text,
                    url: std.id,
                    grade_level: std.dcterms_educationLevel
                }
            });

            $("input.hover-star:checked").each(function(idx, e){
                info.ratings[e.name] = parseInt(e.value);
            });

            var attribution = $("#tos_attribution").val();
            if (attribution) {
                info.tos.submission_attribution = attribution;
            }

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

    var bio = common.fetchJSON("bio");
    $("#tos").val(bio.tos || "");
    $("#tos_attribution").val(bio.tos_attribution);



});