const $ = require('~/common.js');

//Item Factory Function
exports.getNewStationItem = function(data){
    var item = {
        station_id: null, line_id: null, is_upbound: true, is_express_track: false,
        track: null, time1: null, time2: null, is_pass: false, mod: [], remarks: null,
    };
    for (var i in data) item[i] = data[i];
    return item;
};
exports.getNewCrossingItem = function(data){
    var item = {
        is_cross: true,
        station_id: null, cross_id: null, time1: null, time2: null, mod: [], remarks: null,
    };
    for (var i in data) item[i] = data[i];
    return item;
};