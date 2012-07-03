
var sig_utils = require("views/lib/sig_utils");

exports.isCollectorDoc = function(doc) {
        var isLRParadata = false,
            isTheCollector = false;
        if (doc.payload_schema) {
            for (var i=0; i<doc.payload_schema.length; i++) {
                if (doc.payload_schema[i] === "LR Paradata 1.0") {
                    isLRParadata = true;
                } else if (doc.payload_schema[i] === "TheCollector") {
                    isCollectorDoc = true;
                }
            }
        }
        return isLRParadata && isCollectorDoc;
    };


exports.getKeysForView = function(view, doc) {
        var activity = doc.resource_data.activity;
        var keys = [];
        if (sig_utils.check_signature(doc)) {
            if (view === "discriminator-by-resource") {
                var action = activity.verb.action;
                if (action === "rated") {
                    for (var i=0; i<activity.related.length; i++) {
                        var rubric = activity.related[i];
                        keys.push([action, rubric.objectType, rubric.id, activity.verb.measure.value]);
                    }
                } else if (action === "matched") {
                    for (var i=0; i<activity.related.length; i++) {
                        var std = activity.related[i];
                        keys.push([action, std.objectType, std.id, std.description[0], std.description[1]]);
                    }
                }
                
            }
        }

        return keys;
    };

exports.getTimestampForDoc = function(doc) {
    var activity = doc.resource_data.activity;
    var action = activity.verb.action;
    var isots = doc.node_timestamp;
    if (action === "rated") {
        log(JSON.stringify(activity.verb.date));
        isots = activity.verb.date;
    }
    return Math.floor(Date.parse(isots)/1000);
}

exports.searchObjectForPattern = function(obj, regex) {
        var rs = {};
        var tmp = {};
        if (Object.prototype.toString.apply(obj) === "[object String]") {
            tmp = parser(obj.trim(), verb);
        } else if (Object.prototype.toString.apply(obj) === "[object Array]") {
            for (var j=0; j<obj.length; j++) {
                merge(searchObjectForPattern(obj[j], regex), tmp); 
            }
        } else if (Object.prototype.toString.apply(obj) === "[object Object]") {
            for (var key in obj) {
                merge(searchObjectForPattern(obj[key], regex), tmp);
            }
        } 
        if (tmp != undefined && tmp != null) {
            for (var key in tmp) {
                if (rs[key]) {
                    rs[key] += tmp[key];
                } else {
                    rs[key] = tmp[key];
                }
            }
        }

        return rs;
    };

exports.secondsToISODate = function(ts) {
        var ctime = new Date(ts*1000);
        return ctime.toISOString().replace(/\.000Z$/, "Z");
    };

exports.convertDateToSeconds = function(doc){
        return Math.floor(Date.parse(doc.node_timestamp)/1000);
    };
