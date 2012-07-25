
var fs = require("fs"),
    $ = require("jquery"),
    request = require("request"),
    et = require("elementtree"),
    _ = require("underscore");

var fetchStandard = function(std) {

    var man_url = std.uri + "_manifest.json",
        basedir = "../thecollector/js",
        path = basedir + "/" + std.manifest,
        corstd = std.ccstd || undefined;

    var parts = path.split(/\//),
        subpath = "";

    for(var i=0; i<parts.length-1; i++) {
        subpath += parts[i];
        try {
            fs.mkdirSync(subpath);
        } catch (error) {

        }
        subpath += "/";
    }

    console.log(man_url)
    request(man_url, function (error, response, body) {
        try {
            var big = JSON.parse(body);
            var small = JSON.stringify(trimTree(big, undefined, corstd));

            console.log("Writing "+path);
            fs.writeFile(path, small);
        } catch (error) {
            console.log(error);
            console.log(body);
        }
    });


}


var trimTree = function (tree, grade, ccstd) {
        if (_.isArray(tree)) {
            var trimmed = [];
            for (var i=0; i<tree.length; i++) {
                var val =  trimTree(tree[i], grade, ccstd);
                if (val) {
                    trimmed.push(val);
                }
            }
            if (trimmed.length === 0) {
                trimmed = null;    
            }
            return trimmed;
        } else {
            var trimmed = {};
            // var containsGrade = false;
            trimmed.leaf = tree.leaf || false;
            // if (tree.leaf) {
            //     trimmed.leaf = tree.leaf;
            // } else {
            //     trimmed.leaf = false;
            // }

            if (tree.leaf) {
                if (tree.id) {
                    trimmed.id = tree.id;
                }

                if (tree.dcterms_educationLevel) {
                    trimmed.dcterms_educationLevel = [];
                    if (_.isArray(tree.dcterms_educationLevel)) {
                        for (var i=0; i<tree.dcterms_educationLevel.length; i++) {
                            trimmed.dcterms_educationLevel[i] = {
                                prefLabel: tree.dcterms_educationLevel[i].prefLabel
                            };
                            // if (tree.dcterms_educationLevel[i].prefLabel === grade) {
                            //     containsGrade = true;
                            // }
                        }
                    } else {
                        trimmed.dcterms_educationLevel[0] = {
                            prefLabel: tree.dcterms_educationLevel.prefLabel
                        }
                        // if (tree.dcterms_educationLevel.prefLabel === grade) {
                        //     containsGrade = true;
                        // }

                    }
                }

                if (tree.asn_statementNotation) {
                    if (!!ccstd) {
                        trimmed.ccstd = ccstd;
                    }
                    trimmed.asn_statementNotation = tree.asn_statementNotation;
                }
            }
            
            if (tree.text) {
                trimmed.text = $("<div/>").html(tree.text).text();
            }
            if (tree.children) {
                trimmed.children = trimTree(tree.children, grade, ccstd);
                if (!trimmed.children || trimmed.children.length === 0) {
                    trimmed = null;    
                }
            } 
                
                
            // if (!containsGrade) {
            //     trimmed = null;
            // }           

            
            return trimmed;
        }
    }





var standards = [];

// var corestandards = [
//     {
//         title: "Common Core State Standards for Mathematics",
//         ccstd: "Math",
//         uri: "http://asn.jesandco.org/resources/D10003FB",
//         manifest: "std/corestandards/D10003FB.json"
//     },
//     {
//         title: "Common Core State Standards for English Language Arts & Literacy in History/Social Studies, Science, and Technical Subjects",
//         ccstd: "Literacy",
//         uri: "http://asn.jesandco.org/resources/D10003FC",
//         manifest: "std/corestandards/D10003FC.json"
//     }
// ]
require('amd-loader');
var corestandards = require("../thecollector/js/core-stds");

_.each(corestandards.list, function(std, idx) { fetchStandard(std) });

request("http://asn.jesandco.org/api/1/jurisdictions?status=published&class=U.S.%20States%20and%20Territories",
    function(error, response, body){
        var root = $(body);

        var jurisdictions = $("Jurisdiction", root),
            num_jurisdictions = jurisdictions.length;

        _.each(jurisdictions, function(node, idx){
            var row = $(node),
                jurisdiction = $("organizationJurisdiction", row).text(),
                state = {
                    state: $("organizationName", row).text(),
                    jurisdiction: jurisdiction,
                    documents: []
                },
                doc_url = "http://asn.jesandco.org/api/1/documents?jurisdiction="+jurisdiction+"&status=published";
            
            standards.push(state);

            console.log(doc_url);
            request(doc_url,
                function(error2, response2, body2){
                    
                    var root = et.XML(body2),
                        docs = root.findall("Document");

                    _.each(docs, function(doc, index, doc_list){

                        var asnUri = doc.find('DocumentID[@type="asnUri"]'),
                            title = doc.find('DocumentTitle'),
                            std = {
                                uri: asnUri.text,
                                title: title.text,
                                manifest: "stds/" + state.jurisdiction + "/" + /[^\/]+$/.exec(asnUri.text)[0] + ".json"
                            };

                        state.documents.push(std);
                        fetchStandard(std);

                    });

                    num_jurisdictions--;
                    if (num_jurisdictions == 0) {
                        console.log("writing file.");
                        fs.writeFile("../thecollector/js/standards.json", JSON.stringify(standards));
                    }

                });

            
        });


    });



