define(["require", "jquery", "common", "mustache", "moment"],function(require, $, common){
    
    require('mustache');
    require('moment');

    var oauth_info = common.fetchJSON('oauth');

    var resources_since_tmpl = "{{{node_url}}}/extract/thecollector-resources/discriminator-by-resource-ts?resource={{{resource_locator}}}&ids_only=true{{#from}}&from={{{from}}}{{/from}}";


    function getDiscriminatorsSince(url, date) {
        if (date) {
            date = moment(date).subtract('days', 7).sod().toDate();
        }

        var url = Mustache.to_html(resources_since_tmpl, 
            {
                node_url: oauth_info.node_url,
                resource_locator: url,
                from: date.toISOString()
            });

        console.log(url);
        var xhr = common.ajax("GET", url);
        return xhr;
    }

    return {
        getDiscriminatorsSince: getDiscriminatorsSince
    };

    
});