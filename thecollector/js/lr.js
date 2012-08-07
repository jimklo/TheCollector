define(['require', 'common', 'sha1', 'oauth', 'jquery', 'underscore', 'paradata'], function(require, common, sha1, oauth, $) {

    var _ = require('underscore');

    function getLREnvelope(info, oauth_data, bio, resource, tags) {

        var username = null;
        // console.log(oauth_data);
        var req_info = getOAuthInfo(oauth_data);
        xhr = oauthRequest("GET", oauth_data.node_url + '/_session', req_info.message, req_info.accessor);
        xhr.done(function(msg){
            var session = msg;

            if (session.userCtx.name) {
                username = session.userCtx.name;
            }

        });
       
        var resource_data_document = {
            doc_type: "resource_data",
            doc_version: "0.23.0",
            resource_data_type: "paradata",
            active: true,
            identity: {
                submitter_type: "user"
            },
            TOS: info.tos,
            resource_locator: info.resource_url,
            payload_placement: "inline",
            payload_schema: ["LR Paradata 1.0", "TheCollector" ],
            resource_data : resource,
            keys: (!!tags && tags.length > 0) ? tags : [ "TheCollector" ]
        };

        return resource_data_document;
    }


    function getOAuthInfo(oauth_data) {

        var message = {
            parameters: {
            }
        };
        var accessor = {
            consumerKey: oauth_data.consumer_key,
            consumerSecret: oauth_data.consumer_secret,
            token: oauth_data.token,
            tokenSecret: oauth_data.token_secret
        };

        return { 
            message: message,
            accessor: accessor
        };
    }

    function oauthRequest(method, path, message, accessor, undefined) {
        message.action = path;
        message.method = method || 'GET';
        OAuth.completeRequest(message, accessor);
        var parameters = message.parameters;
        if (method == "POST" || method == "GET") {
            if (method == "GET") {
                return common.ajax("GET", OAuth.addToURL(path, parameters));
                // return CouchDB.request("GET", OAuth.addToURL(path, parameters));
            } else if (method == "POST" && message.body !== undefined) {
                return common.ajax(method, path, {
                    headers: {
                            Authorization: OAuth.getAuthorizationHeader('', parameters)
                    },
                    data: JSON.stringify(message.body)
                });
            } else {
                console.log(OAuth.formEncode(parameters))
                return common.ajax("POST", path, {
                    contentType: "application/x-www-form-urlencoded",
                    headers: {
                        Accept: "application/json"
                    },
                    data: OAuth.formEncode(parameters)
                });
            }
        } else {
            return CouchDB.request(method, path, {
                headers: {
                    Authorization: OAuth.getAuthorizationHeader('', parameters)
                }
            });
        }
    }

    function postEnvelopes(oauth_data, envelopes) {
        req_info = getOAuthInfo(oauth_data);
        req_info.message.body = {
            documents: envelopes
        };
        xhr = oauthRequest("POST", oauth_data.node_url + '/publish', req_info.message, req_info.accessor);
        return xhr;
    }

    var paradata_util = require("paradata");

    return {
        submitToLR: function(info) {
            var bio = common.fetchJSON('bio');
            var oauth_data = common.fetchJSON('oauth');

            if (!!bio && !!bio.twitter) {
                bio.twitter_info = common.fetchJSON('twitter');
            }
            var tags = ["TheCollector"]
            if (!!info.tags){
                tags = tags.concat(info.tags.split(/,/));
            }
            var envelopes = [];

            // Standards Alignment & Rubric I Ratings
            var paradata_list = paradata_util.getLRParadataForStandard(info, bio);
            _.each(paradata_list, function(paradata) {
                envelopes.push(getLREnvelope(info, oauth_data, bio, paradata, tags));            
            });

            // Rubric II - VII Ratings
            _.each(info.ratings, function(rubric_rating, rubric_key) {
                info.rating = rubric_rating;
                var paradata = paradata_util.getLRParadataForRubric(info, bio, rubric_key);
                envelopes.push(getLREnvelope(info, oauth_data, bio, paradata, tags)); 
            });

            // Comments
            var paradata = paradata_util.getLRParadataForComment(info, bio);
            if (paradata) {
                envelopes.push(getLREnvelope(info, oauth_data, bio, paradata, tags));
            }

            // tags
            paradata = paradata_util.getLRParadataForTags(info, bio);
            if (paradata) {
                envelopes.push(getLREnvelope(info, oauth_data, bio, paradata, tags));
            }

            return postEnvelopes(oauth_data, envelopes);
        }
    };

});