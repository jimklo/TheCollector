define(["require", "jquery", "common", "underscore", "mustache", "moment"],function(require, $, common, _){
    
    require('mustache');
    require('moment');

    var oauth_info = common.fetchJSON('oauth');

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

    function processDataServiceResponse(response, url){
        var docs = response.documents;
        var url_data = {
            standards: {},
            rubrics: {},
            date: new Date().toISOString()
        }
        for (var i in docs) {
            var data = docs[i].result_data;
            var num_raw = docs[i].resource_data.length;
            if (data.discriminator[0]==="matched" && data.discriminator[1]==="academic standard") {
                url_data.standards[data.discriminator[2]] = url_data.standards[data.discriminator[2]] || 0
                url_data.standards[data.discriminator[2]] += num_raw;
            }
            else if (data.discriminator[0]==="rated" && data.discriminator[1]==="OER Rubric") {
                url_data.rubrics[data.discriminator[2]] = url_data.rubrics[data.discriminator[2]] || {"-1":0,"0":0,"1":0,"2":0,"3":0};
                url_data.rubrics[data.discriminator[2]][String(data.discriminator[3])] =  url_data.rubrics[data.discriminator[2]][String(data.discriminator[3])] || 0;
                url_data.rubrics[data.discriminator[2]][String(data.discriminator[3])] += num_raw;
            }
        }


        url_data.standards = _.map(_.keys(url_data.standards).sort(), function(key) {
            return { name: key, count: url_data.standards[key] };
        });
        url_data.rubrics = _.map(_.keys(url_data.rubrics).sort(), function(key) {

            var key_ratings = _.map(_.keys(url_data.rubrics[key]).sort(), function(rating) {
                return { name: oerrating(rating), count: url_data.rubrics[key][rating] };
            });

            return { name: key, ratings: key_ratings };
        });
        common.putJSON(url, url_data);
    }

    function getDiscriminatorsSince(url, date) {
        if (date) {
            date = moment(date).subtract('days', 7).sod().toDate();
        }

        var lr_url = Mustache.to_html(resources_since_tmpl, 
            {
                node_url: oauth_info.node_url,
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