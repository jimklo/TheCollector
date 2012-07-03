// make check for navigator properties not fail.
var navigator = navigator || {};


// support some basic HTML5 localStorage operations
function _localStorage() {

    this.ls = {};

    this.getItem = function(key) {
        return this.ls[key] || null;
    };

    this.setItem = function(key, value) {
        this.ls[key] = value;
        return this;
    }

    return this;
}
var window = window || {};
window.localStorage = window.localStorage || _localStorage();

// support some minimal jquery need that's used for encoding messages for display in openpgp.js
function jQuery(foo) {

    this.text = function(txt) {
        this._txt = txt;
        return this;
    }

    this.html = function() {
        return this._txt;
    }

    return this;
}
var $ = jQuery;

// support undefined function in from openpgp.js
function showMessages(text) {
    // print(text);
}

var whitelist = require("views/lib/whitelist");

var openpgp_lib = require("views/lib/openpgp");
// var openpgp = openpgp_lib.openpgp;

var initialized = false;

function loadPublicKeys() {
    if (!initialized) {
        // openpgp.init();
        // openpgp.keyring.importPublicKey(whitelist.armoredPublicKeys);
        // openpgp.keyring.store();
        initialized = true;
        log('loaded public keys');
    }
}

exports.check_signature = function(doc) {
    var isValid = false;
    if (doc.digital_signature && doc.digital_signature.signature) {
        loadPublicKeys();
        // isValid = openpgp.checkSignature(doc.digital_signature.signature)
    } else {
        isValid = true;
    }
    log("has valid sig: "+isValid);
    return isValid;
}
