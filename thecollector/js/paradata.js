define(["rubric", "underscore"],function(){

    var _ = require('underscore');
    var rubric_util = require('rubric');

    function getActor(bio) {
        var actor = {
            description: [],
            objectType: "anonymous user"
        }
        if (!!bio.twitter && !!bio.twitter_info)
            actor.id = bio.twitter;
            actor.objectType = "twitter";
            actor.description.push(bio.twitter_info.name);
            actor.description.push(bio.twitter_info.description);
        
        if (!!bio.occupation_other) {
            actor.description.push(bio.occupation_other);
        } else if (!!bio.occupation) {
            actor.description.push(bio.occupation);
        }

        if (!!bio.grade_other) {
            actor.description.push(bio.grade_other);
        } else if (!!bio.grade) {
            actor.description.push(bio.grade);
        }

        if (!!bio.subject) {
            actor.description = actor.description.concat(bio.subject.split(/,/));
        }

        if (actor.description.length === 0) {
            delete actor.description;
        }

        return actor;
    }

    function getRatedVerb(info, date) {
        return {
                action: "rated",
                date: date.toISOString(),
                measure: {
                    sampleSize: 1,
                    scaleMin: -1,
                    scaleMax: 3,
                    value: info.rating
                }
            };
    }

    function getMatchedVerb(info, date) {
        return {
                action: "matched",
                date: date.toISOString()
            };
    }

    function getCommentedVerb(info, date) {
        return {
            action: "commented",
            description: [ info.comment ],
            date: date.toISOString()
        }
    }

    function getTaggedVerb(info, date) {

        return {
            action: "tagged",
            description: info.tags.split(/,/),
            date: date.toISOString()
        }
    }

    function getObject(info) {
        return {
            id: info.resource_url,
            description: [info.resource_title],
            objectType: "resource"
        };
    }

    function getStandard(standard) {
        var std = {
            objectType: "academic standard",
            id: standard.url
        };

        var desc = ["jurisdiction", "standard", "dot_notation", "text"];

        for (var i in desc) {
            if (!!standard[desc[i]]) {
                std.description = std.description || [];
                std.description.push(standard[desc[i]])
            }
        }

        return std;
    }

    function getRubric(rubric) {
        return {
            objectType: rubric.rubric,
            id: rubric.id,
            description: [ rubric.title ]
        }

    }

    return {

        getLRParadataForStandard: function(info, bio) {
            var d = new Date();

            

            var paradata_list = [];
            _.each(info.standards, function(std, index, list) {
                var paradata = {
                    activity: {
                        actor: getActor(bio),
                        verb: getMatchedVerb(info, d),
                        object: getObject(info),
                        related: [ getStandard(std) ]
                    }
                };
                paradata_list.push(paradata);

                if (!!std.rating && !!std.rating.rubric) {
                    var para_rubric = getRubric(rubric_util[std.rating.rubric]),
                        ratings_paradata = {
                            activity: {
                                actor: getActor(bio),
                                verb: getRatedVerb({rating: std.rating.value}, d),
                                object: getObject(info),
                                related: [
                                    getStandard(std)
                                ]
                            }
                        };
                    
                    ratings_paradata.activity.verb.context = para_rubric;

                    paradata_list.push(ratings_paradata);

                }

            });

            return paradata_list;
        },

        getLRParadataForRubric: function (info, bio, rubric_key) {
            var d = new Date();

            var paradata = {
                activity: {
                    actor: getActor(bio),
                    verb: getRatedVerb(info, d),
                    object: getObject(info)
                }
            };
            paradata.activity.verb.context = getRubric(rubric_util[rubric_key]);

            return paradata;
        },

        getLRParadataForComment: function (info, bio) {
            var d = new Date();
            
            if (!info.comment) return null;

            var paradata = {
                activity: {
                    actor: getActor(bio),
                    verb: getCommentedVerb(info, d),
                    object: getObject(info)
                }
            };

            return paradata;
        },

        getLRParadataForTags: function (info, bio) {
            var d = new Date();
            
            if (!info.tags || info.tags.length == 0) return null;

            var paradata = {
                activity: {
                    actor: getActor(bio),
                    verb: getTaggedVerb(info, d),
                    object: getObject(info)
                }
            };

            return paradata;
        }
    }

});