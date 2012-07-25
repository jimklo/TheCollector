define(function(require, exports, module){

var corestandards_list = [
    {
        title: "Common Core State Standards for Mathematics",
        ccstd: "Math",
        uri: "http://asn.jesandco.org/resources/D10003FB",
        manifest: "stds/corestandards/D10003FB.json"
    },
    {
        title: "Common Core State Standards for English Language Arts & Literacy in History/Social Studies, Science, and Technical Subjects",
        ccstd: "Literacy",
        uri: "http://asn.jesandco.org/resources/D10003FC",
        manifest: "stds/corestandards/D10003FC.json"
    }
];

var corestandards_map = {};

corestandards_list.forEach(function (elem, index, ary){
    corestandards_map[elem.ccstd] = elem;
});

return {
    list: corestandards_list,
    map: corestandards_map
}

});