define(function(){

    function getActor(bio) {
        var actor = {
            description: [bio.occupation, bio.grade, bio.subject],
            objectType: bio.occupation
        }
        if (bio.twitter)
            actor.id = bio.twitter;
            actor.objectType = "twitter";
            
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

    function getObject(info) {
        return {
            id: info.resource_url,
            description: [info.resource_title],
            objectType: "resource"
        };
    }

    function getRelatedStandard(standard) {
        return {
            objectType: "academic standard",
            id: standard.dot_notation,
            description:[standard.url, standard.text]
        }
    }

    function getRelatedRubric(rubric) {
        return {
            objectType: "OER Rubric",
            id: rubric.rubric,
            description: [ rubric.rubric, rubric.title ]
        }

    }

    return {

        getLRParadataForStandard: function(info, bio) {
            var d = new Date();

            var paradata = {
                activity: {
                    actor: getActor(bio),
                    verb: getMatchedVerb(info, d),
                    object: getObject(info),
                    related: [
                        getRelatedStandard(info.standard)
                    ]
                }
            };

            return paradata;
        },

        getLRParadataForRubric: function (info, bio, rubric) {
            var d = new Date();

            var paradata = {
                activity: {
                    actor: getActor(bio),
                    verb: getRatedVerb(info, d),
                    object: getObject(info),
                    related: [
                        getRelatedRubric(rubric)
                    ]
                }
            };

            return paradata;
        }
    }

});