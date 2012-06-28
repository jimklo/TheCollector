var chrome_getJSON = function(url, data, callback) {
  // console.log("sending RPC");
  chrome.extension.sendRequest({"action":"getJSON", "data":data, "url":url}, callback);
}

var chrome_ajax = function(data) {
  // console.log("sending RPC");
  chrome.extension.sendRequest({"action":"ajax", "data":data}, data.success);
}

var chrome_ajax_error = function(data) {
  // console.log("sending RPC");
  chrome.extension.sendRequest({"action":"ajax_error", "data":data}, data.success);
}

var chrome_mustache = function(id, data, callback) {
  chrome.extension.sendRequest({"action":"mustache", "id": id, "data":data}, callback);
}