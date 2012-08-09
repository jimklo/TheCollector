
var whitelist = require("views/lib/whitelist");
var openpgp_js = require("views/lib/openpgp-min");
var openpgp = openpgp_js.openpgp;

var initialized = false;

function showMessages(message) {
    // log(message);
}

function messageFormat(template, str){
    return str;
}


function loadPublicKeys() {
    if (!initialized) {
        openpgp_js.setShowMessages(showMessages);
        openpgp_js.setMessageFormat(messageFormat);

        openpgp.init();

        for (var i=0; i<whitelist.armoredPublicKeys.length; i++) {
            var success = openpgp.keyring.importPublicKey(whitelist.armoredPublicKeys[i].public_key);
        }
        
        // openpgp.keyring.store(); /* don't need to do this since function is idempotent */
        initialized = true;
    }
}

exports.check_signature = function(doc) {
    var isValid = false;
    if (doc.digital_signature && doc.digital_signature.signature) {
        loadPublicKeys();
        var msg_list = openpgp.read_message(doc.digital_signature.signature);
        for (var i=0; i<msg_list.length; i++) {
            isValid |= msg_list[i].verifySignature();
        }
        
    } else {
        isValid = true;
    }
    return isValid;
}
