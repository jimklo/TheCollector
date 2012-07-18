require.config(
    {
        paths: {
            'underscore': 'underscore-min',
            'jquery-ui': 'jquery-ui-1.8.21.custom.min',
            'jquery.rating': 'jquery.rating.pack',
            'moment': 'moment.min',
            'Math': 'mcc',
            'Literacy': 'ecc'
        }
    });
require(["jquery", "twitter-oauth", "social"], function($, TwitterOAuth, social) {

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
                    callback();
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

    twitter.fetchUserInfo = function(callback) {
        if (!twitter.hasUserInfo()) {
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