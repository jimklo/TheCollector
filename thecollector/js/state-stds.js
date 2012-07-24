define(['jquery', 'underscore', 'common'], function($, _, common){
    
    var menu_data_url = chrome.extension.getURL('js/standards.json'),
        cur_idx = undefined,
        all_jurisdictions = undefined;

    function loadJurisdictions(j_id) {
        var juris = $("#"+j_id),
            populate = function (states) {
                all_jurisdictions = states;
                _.each(all_jurisdictions, function(state, i){
                    $("<option value='"+i+"' data='"+state.jurisdiction+"'>"+state.state+"</option>").appendTo(juris);
                });
            };

        $("<option/>").appendTo(juris);
        if (!all_jurisdictions) {
            var xhr = common.ajax('GET', menu_data_url);
            xhr.done(populate);
        } else {
            populate(all_jurisdictions);
        }
        
    }


    function loadStateStandards(s_id) {
        var callback = function(eventObj){
            var self = $(this),
                j_idx = self.val(),
                sid = $("#"+s_id);

            sid.empty();
            _.each(all_jurisdictions[j_idx].documents, function(doc){
                $("<option value='"+doc.manifest+"' data='"+doc.uri+"'>"+doc.title+"</option>").appendTo(sid);
            });



        }
        return callback;
    }

    function selectedStandard(cb) {
        return function (evtObj) {
            var self = $(this),
                manifest_url = chrome.extension.getURL('js/'+self.val());

            var xhr = common.ajax('GET', manifest_url);
            xhr.done(cb);
        }
    }

    return {
        init: function(j_id, s_id, onStdChange, onGradeChange){
            loadJurisdictions(j_id);
            $("#"+j_id).change(loadStateStandards(s_id));
            $("#"+s_id).change(selectedStandard(onStdChange));

        }

    }

});