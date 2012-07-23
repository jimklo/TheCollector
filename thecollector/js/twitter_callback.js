require.config(
    {
        paths: {
            'jquery-ui': 'libs/jquery-ui-1.8.21.custom.min',
            'jquery.jstree': 'libs/jquery.jstree',
            'jquery.rating': 'libs/jquery.rating.pack',
            'moment': 'libs/moment.min',
            'mustache': 'libs/mustache',
            'oauth-simple': 'libs/oauth-simple',
            'oauth': 'libs/oauth',
            'sha1': 'libs/sha1',
            'underscore': 'libs/underscore-min',
            'Math': 'mcc',
            'Literacy': 'ecc'
        }

    });
require(["twitter-oauth"], function(TwitterOAuth) {

    TwitterOAuth.initCallbackPage();

});