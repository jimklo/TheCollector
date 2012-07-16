define(["require", "mustache"], function(require) {

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

var doMustache = function (id, data, callback) {
    var template = $('#'+id).html()

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

    var html = Mustache.to_html(template, data);
    callback(html);
}

var doMustachePartials = function (id, partials, data, callback) {
    var template = $('#'+id).html()

    var partial_map = {};
    for (partial_id in partials) {
        partial_map[partials[partial_id]] = $('#'+partials[partial_id]).html();
    }

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


return {
    render: doMustache,
    renderPartials: doMustachePartials,
    fetchJSON: fetchJSON,
    putJSON: putJSON,
    isArray: isArray
};

});