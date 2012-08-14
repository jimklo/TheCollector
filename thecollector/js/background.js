require.config(
    {
        paths: {
            'jquery-ui': 'libs/jquery-ui-1.8.21.custom.min',
            'jquery.jstree': 'libs/jquery.jstree',
            'jquery.rating': 'libs/jquery.rating',
            'moment': 'libs/moment.min',
            'mustache': 'libs/mustache-chrome',
            'oauth-simple': 'libs/oauth-simple',
            'oauth': 'libs/oauth',
            'sha1': 'libs/sha1',
            'underscore': 'libs/underscore-min'
        }

    });
require(["jquery", "twitter-oauth", "social", "lrnode"], function($, TwitterOAuth, social, lrnode) {

    function defaultLRNode() {
        function setDefault() {
            localStorage["oauth"] = JSON.stringify(lrnode.oauth);
        }
        if (!localStorage.hasOwnProperty("oauth")) {
            setDefault();
        } else {
            var node_oauth = JSON.parse(localStorage["oauth"]);

            var noinit = true;
            for (var i in lrnode.oauth) {
                noinit &= !!node_oauth[i];
            }
            if (!noinit) {
                setDefault();
            }
        }
    }
    defaultLRNode();

    var oauth = TwitterOAuth.initBackgroundPage({
        'request_url': 'https://api.twitter.com/oauth/request_token',
        'authorize_url': 'https://api.twitter.com/oauth/authorize',
        'access_url': 'https://api.twitter.com/oauth/access_token',
        'consumer_key': 'ZLZ0b5qX1GArMTsIJLDYA',
        'consumer_secret': 'Z38wbgTloKryMCzvLlP8csfGGGuGkwpbzSU6PP9NvA'
    });


    var twitter = {};

    twitter.processCredentials = function(callback){ 
        return function(data, xhr) {
            if (xhr.status === 200) {
                console.log(data);

                localStorage['twitter'] = data;
                if (callback) {
                    callback(JSON.parse(data));
                }
            }
        }
    }

    twitter.hasUserInfo = function() {
        return (oauth.hasToken() && !!localStorage['twitter']);
    }

    twitter.getUserInfo = function() {
        return JSON.parse(localStorage['twitter']);
    }

    twitter.fetchUserInfo = function(callback, force) {
        if (!twitter.hasUserInfo() || !!force) {
            var url = "https://api.twitter.com/1/account/verify_credentials.json";

            var params = {};
            oauth.sendSignedRequest(url, twitter.processCredentials(callback), params);
            return true;
        }
        return false;
    }

    function setBadgeText(opt_badgeObj) {
        if (opt_badgeObj) {
            var badgeOpts = {};
            if (opt_badgeObj && opt_badgeObj.text != undefined) {
                badgeOpts['text'] = opt_badgeObj.text;
            }
            if (opt_badgeObj && opt_badgeObj.tabId) {
                badgeOpts['tabId'] = opt_badgeObj.tabId;
            }
            chrome.browserAction.setBadgeText(badgeOpts);
        }
    };

    function setBadgeColor(opt_badgeObj) {
        if (opt_badgeObj) {
            var badgeOpts = {};
            if (opt_badgeObj && opt_badgeObj.color != undefined) {
                badgeOpts['color'] = opt_badgeObj.color;
            }
            if (opt_badgeObj && opt_badgeObj.tabId) {
                badgeOpts['tabId'] = opt_badgeObj.tabId;
            }
            chrome.browserAction.setBadgeColor(badgeOpts);
        }
    };


    function logout(callback) {
        oauth.clearTokens();
        delete localStorage['twitter'];
        if (callback) {
            callback();
        }
    };

    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
            if (request.action === "updateBadge") {
                var xhr = social.getDiscriminatorsSince(sender.tab.url, new Date());
                xhr.done(function(data_service) {
                    if (data_service.documents && data_service.documents.length > 0){
                        setBadgeText({'text': "!", 'tabId': sender.tab.id });
                    } else {
                        setBadgeText({'text': "", 'tabId': sender.tab.id });
                    }
                });
            }
        });

    window.twitter = twitter;
    window.oauth = oauth;
    window.setBadgeText = setBadgeText;
    window.logout = logout;

});