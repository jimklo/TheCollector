
exports.dataservices = {
    name: "thecollector-resources",
    description: "This Data Service returns rating and alignment data performed by TheCollector chrome plugin."
}

exports.views = {
    "discriminator-by-resource": {
        "map": function(doc) {
            var collector = require('views/lib/collector');
            try {
                if (doc.doc_type == "resource_data" && doc.resource_data && doc.resource_locator && doc.node_timestamp) {
                    var nodeTimestamp = collector.convertDateToSeconds(doc);
                    if (collector.isCollectorDoc(doc, collector.collectorVersions)) {
                        var discriminators = collector.getKeysForView("discriminator-by-resource", doc);
                        for (var i=0; i<discriminators.length; i++) {
                            emit([doc.resource_locator, discriminators[i]], nodeTimestamp);                         
                        }
                    }
                }   
            
            } catch (error) {

                log("error:"+error);
            }
        }
    }
    ,
    "discriminator-by-resource-ts": {
        "map": function(doc) {
            var collector = require('views/lib/collector');
            try {
                if (doc.doc_type == "resource_data" && doc.resource_data && doc.resource_locator && doc.node_timestamp) {
                    if (collector.isCollectorDoc(doc, collector.collectorVersions)) {
                        var nodeTimestamp = collector.getTimestampForDoc(doc);
                        var discriminators = collector.getKeysForView("discriminator-by-resource", doc);
                        for (var i=0; i<discriminators.length; i++) {
                            emit([doc.resource_locator, nodeTimestamp, discriminators[i]], null);                         
                        }
                    }
                }   
            
            } catch (error) {
                    log("error:"+error);
                    throw error;
            }
        }
    },
    "discriminator-by-ts": {
        "map": function(doc) {
            var collector = require('views/lib/collector');
            try {
                if (doc.doc_type == "resource_data" && doc.resource_data && doc.resource_locator && doc.node_timestamp &&
                    collector.isCollectorDoc(doc, collector.collectorVersions)) {
                    var nodeTimestamp = collector.getTimestampForDoc(doc);
                    var discriminators = collector.getKeysForView("discriminator-by-resource", doc);
                    for (var i=0; i<discriminators.length; i++) {
                        emit([nodeTimestamp, discriminators[i]], null);
                    }
                }   
            
            } catch (error) {
                    log("error:"+error);
            }
        }
    },
    "resource-by-discriminator": {
        "map": function(doc) {
            var collector = require('views/lib/collector');
            if (doc.doc_type == "resource_data" && doc.resource_data && doc.resource_locator && doc.node_timestamp &&
                collector.isCollectorDoc(doc, collector.collectorVersions)) {
                var nodeTimestamp = collector.getTimestampForDoc(doc);
                var discriminators = collector.getKeysForView("discriminator-by-resource", doc);
                for (var i=0; i<discriminators.length; i++) {
                    emit([discriminators[i], doc.resource_locator], nodeTimestamp);
                }
            }   
            
        }
    },
    "resource-by-discriminator-ts": {
        "map": function(doc) {
            var collector = require('views/lib/collector');
            if (doc.doc_type == "resource_data" && doc.resource_data && doc.resource_locator && doc.node_timestamp &&
                collector.isCollectorDoc(doc, collector.collectorVersions)) {
                var nodeTimestamp = collector.getTimestampForDoc(doc);
                var discriminators = collector.getKeysForView("discriminator-by-resource", doc);
                for (var i=0; i<discriminators.length; i++) {
                    emit([discriminators[i], nodeTimestamp, doc.resource_locator], null);
                }
            }   
        }
    },
    "resource-by-ts": {
        "map": function(doc) {
            var collector = require('views/lib/collector');
            if (doc.doc_type == "resource_data" && doc.resource_data && doc.resource_locator && doc.node_timestamp &&
                collector.isCollectorDoc(doc, collector.collectorVersions)) {
                var nodeTimestamp = collector.getTimestampForDoc(doc);
                var discriminators = collector.getKeysForView("discriminator-by-resource", doc);
                if (discriminators.length > 0) {
                    emit([nodeTimestamp, doc.resource_locator], null);
                }
            }   
        }
    }
};


exports.lists = {

    "to-json": function(head, req) {
        var util = require("views/lib/util").init();

        var info = util.GetViewInfo(req),
            parser = util.RowParser(info.view),
            row = null,
            first_group = true,
            groups = {
                cur_group: null,
                prev_group: null
            },
            result_data = {},
            count = 0,
            seen = {};


        send('{"documents":[');
        while (row = getRow()) {
            count++;

            groups = util.GroupIt(parser.group_length, groups, row);
            if (groups.changed) {
                if (first_group) {
                    first_group = false;
                } else {
                    send("]},");
                }

                result_data = {
                    resource: parser.resource(row),
                    discriminator: parser.discriminator(row)
                };

                if (parser.showTimestamp){
                    result_data.timestamp = util.secondsToISODate(parser.timestamp(row));
                }

                send('{"result_data":' + JSON.stringify(result_data) + ',');
                send('"resource_data":[');
                send(JSON.stringify(parser.either(row)));
                var id = parser.id(row);
                if (id) {
                    seen = {};
                    seen[id] = 1;
                }
            } else {
                var id = parser.id(row);
                if (id && !seen[id]) {
                    send(',' + JSON.stringify(parser.either(row)));
                    seen[id] = 1;
                }
            }

        }
        if (count > 0) {
            send("]}");
        }
        send(']}');

    },

    "to-debug": function(head, req) {
        send("{");
        var row;
        send("\"rows\": [");
        var first = true;
        while (row = getRow()) {
            if (!first) {
                send(",");
            } else {
                first = false;
            }
            send(JSON.stringify(row));
        }
        send("],");
        send("\"head\":"+JSON.stringify(head)+",");
        send("\"req\":"+JSON.stringify(req));
        send("}");
    }
};
