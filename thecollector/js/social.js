define(["require", "jquery", "common", "underscore", "mustache", "moment", "rubric"],function(require, $, common, _){
    
    require('mustache');
    require('moment');
    var rubric_util = require('rubric');

    var oauth_info = function() {
            return common.fetchJSON('oauth')
    };

    var resources_since_tmpl = "{{{node_url}}}/extract/thecollector-resources/discriminator-by-resource-ts?resource={{{resource_locator}}}&ids_only=true{{#from}}&from={{{from}}}{{/from}}";
    
    function oerrating(rating) {
        var str;
        switch(rating){
            case "0":
            case 0:
                str = "Very Weak or No Value";
                break;
            case "1":
            case 1:
                str = "Limited";
                break;
            case "2":
            case 2:
                str = "Strong";
                break;
            case "3":
            case 3:
                str = "Superior";
                break;
            default:
                str = "Not Applicable";
        }
        return str;
    }

    function oerdetail(rubric) {
        var detail = {
            title: rubric
        }
        _.each(_.keys(rubric_util), function(key) {
            if (rubric_util[key].rubric === rubric) {
                detail = rubric_util[key];
            }
        });
        return detail;
    }

    function processDataServiceResponse(response, url){
        var docs = response.documents;
        var url_data = {
            standards: {},
            rubrics: {},
            date: new Date().toISOString()
        };

        for (var i in docs) {
            var data = docs[i].result_data;
            var num_raw = docs[i].resource_data.length;
            if (data.discriminator[0]==="matched" && data.discriminator[1]==="academic standard") {
                url_data.standards[data.discriminator[2]] = url_data.standards[data.discriminator[2]] 
                || { 
                    id: data.discriminator[2] || "",
                    jurisdiction: data.discriminator[3] || "",
                    standard: data.discriminator[4] || "",
                    dotNotation: data.discriminator[5] || "",
                    detail: data.discriminator[6] || "",
                    count: 0
                };
                url_data.standards[data.discriminator[2]].count += num_raw;
            }
            else if (data.discriminator[0]==="rated" && data.discriminator[1].match(/Achieve OER Rubric/)) {

                if (data.discriminator.length > 4) {
                    url_data.rubrics[data.discriminator[1]] = url_data.rubrics[data.discriminator[1]] || {};
                    url_data.rubrics[data.discriminator[1]].stds = url_data.rubrics[data.discriminator[1]].stds || {};
                    url_data.rubrics[data.discriminator[1]].stds[data.discriminator[4]] = {
                        id: data.discriminator[4] || "",
                        jurisdiction: data.discriminator[5] || "",
                        standard: data.discriminator[6] || "",
                        dotNotation: data.discriminator[7] || "",
                        detail: data.discriminator[8] || ""
                    };
                    url_data.rubrics[data.discriminator[1]].stds[data.discriminator[4]].ratings = url_data.rubrics[data.discriminator[1]].stds[data.discriminator[4]].ratings || {"-1":0,"0":0,"1":0,"2":0,"3":0};
                    url_data.rubrics[data.discriminator[1]].stds[data.discriminator[4]].ratings[String(data.discriminator[3])] = url_data.rubrics[data.discriminator[1]].stds[data.discriminator[4]].ratings[String(data.discriminator[3])] || 0;
                    url_data.rubrics[data.discriminator[1]].stds[data.discriminator[4]].ratings[String(data.discriminator[3])] += num_raw;
                } else {
                    url_data.rubrics[data.discriminator[1]] = url_data.rubrics[data.discriminator[1]] || {ratings: {"-1":0,"0":0,"1":0,"2":0,"3":0}};
                    url_data.rubrics[data.discriminator[1]].ratings[String(data.discriminator[3])] =  url_data.rubrics[data.discriminator[1]].ratings[String(data.discriminator[3])] || 0;
                    url_data.rubrics[data.discriminator[1]].ratings[String(data.discriminator[3])] += num_raw;
                }
            }
        }


        url_data.standards = _.map(_.keys(url_data.standards).sort(), function(key) {
            return url_data.standards[key];
        });
        url_data.rubrics = _.map(_.keys(url_data.rubrics).sort(), function(key) {

            var detail = oerdetail(key);

            if (!!url_data.rubrics[key].stds) {
                detail.stds = _.chain(url_data.rubrics[key].stds)
                    .values()
                    .sortBy(function (s) {
                        s.ratings = _.map(_.keys(s.ratings).sort(), function(rating) {
                            return { name: oerrating(rating), count: s.ratings[rating] };
                        });
                        return s.jurisdiction+s.standard+s.dotNotation+s.detail;
                    }).value();
            } else {
                var key_ratings = _.map(_.keys(url_data.rubrics[key].ratings).sort(), function(rating) {
                    return { name: oerrating(rating), count: url_data.rubrics[key].ratings[rating] };
                });
                detail.ratings = key_ratings;
            }
            return detail;
        });
        common.putJSON(url, url_data);
    }

    function getDiscriminatorsSince(url, date) {
        if (date) {
            date = moment(date).subtract('days', 7).sod().toDate();
        }

        var lr_url = Mustache.to_html(resources_since_tmpl, 
            {
                node_url: oauth_info().node_url,
                resource_locator: url,
                from: date.toISOString()
            });

        console.log(lr_url);
        var xhr = common.ajax("GET", lr_url);
        xhr.done(function(data_service) {
            if (data_service.documents && data_service.documents.length > 0) {
                processDataServiceResponse(data_service, url);
            } 
        });

        return xhr;
    }

    return {
        getDiscriminatorsSince: getDiscriminatorsSince
    };

    
});