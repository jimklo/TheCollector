define(["require", "jquery", "mustache"], function(require, $) {

var mustache = require('mustache');

var mt_cap = function() {
    return function(text, render) {
        var r = render(text);
        return r.charAt(0).toUpperCase() + r.slice(1);
    }
}

var mt_capitalED = function() {
  return function(text, render) {
    var r = render(text);
    if (!r.match(/ed$/)) {
        if (r.match(/e$/)) {
            r += "d";
        } else {
            r += "ed";
        }
    }
    return r.charAt(0).toUpperCase() + r.slice(1);
  }
}

var mt_linkify = function() {
    return function(text, render) {
        var r = render(text);
        var l = r.replace(/(https?:\/\/[^ ]+)/gi, '<a href="$1" target="_blank">$1</a>');
        return l;
    }
}

var mt_script = function() {
    return function(text, render) {
        return "<script>"+render(text)+"</script>";
    }
}

var mt_denumeral = function() {
    return function(text, render){
        var r = render(text);
        var l = r.replace(/^[0-9]+.\s+/, '');
        return l;
    }
}

var mt_classify = function() {
    return function(text, render) {
        var r = render(text);
        var l = r.replace(/[\s\.-+&]+/, '_');
        return l;
    }
}

var addMustacheWax = function(data) {
    if (!data.capitaled) {
        data.capitaled = mt_capitalED;
    }

    if (!data.cap) {
        data.cap = mt_cap;
    }

    if (!data.linkify) {
        data.linkify = mt_linkify;
    }

    if (!data.script) {
        data.script = mt_script;
    }

    if (!data.denumeral) {
        data.denumeral = mt_denumeral;
    }

    if (!data.classify) {
        data.classify = mt_classify;
    }

    return data;
}

var doMustache = function (id, data, callback) {
    var template = $('#'+id).html()

    data = addMustacheWax(data);

    var html = Mustache.to_html(template, data);
    callback(html);
}

var doMustachePartials = function (id, partials, data, callback) {
    var template = $('#'+id).html()

    var partial_map = {};
    for (partial_id in partials) {
        partial_map[partials[partial_id]] = $('#'+partials[partial_id]).html();
    }

    data = addMustacheWax(data);

    var html = Mustache.to_html(template, data, partial_map);
    callback(html);
}

var fetchJSON = function (key) {
    return JSON.parse(localStorage[key]);
}

var putJSON = function(key, obj) {
    localStorage[key] = JSON.stringify(obj);
}

var isArray= function(obj) {
    return Object.prototype.toString.call([]) === Object.prototype.toString.call(obj);
}


var ajax = function(method, url, options) {
        var settings = {
            type: method,
            contentType: "application/json",
            dataType: "json"
        }
        if (options) {
            settings = _.extend(settings, options);
        }
        var request = $.ajax(url, settings);
        request.done(function(msg){
            console.log("Done");
            console.log(msg);
        });
        request.fail(function(msg){
            console.log("Fail");
            console.log(msg);
        });
        return request;
    }

return {
    render: doMustache,
    renderPartials: doMustachePartials,
    fetchJSON: fetchJSON,
    putJSON: putJSON,
    isArray: isArray,
    ajax: ajax
};

});