require(["jquery", "twitter-oauth"], function($, TwitterOAuth) {

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

    function setIcon(opt_badgeObj) {
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


    function logout(callback) {
        // setIcon({'text': ''});
        oauth.clearTokens();
        delete localStorage['twitter'];
        if (callback) {
            callback();
        }
    };


    window.twitter = twitter;
    window.oauth = oauth;
    window.setIcon = setIcon;
    window.logout = logout;

});