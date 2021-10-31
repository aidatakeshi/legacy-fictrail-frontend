const $ = require('~/common.js');

exports.rules = {
    'pivot_remainder_eq': {
        param_labels: ["除數", "餘數"],
        param_types: ["minsec", "minsec"],
        label: ["基準時間除以","的餘數為"],
        placeholders: ["XX", "XX"],
    },
    'pivot_remainder_not': {
        param_labels: ["除數", "餘數"],
        param_types: ["minsec", "minsec"],
        label: ["基準時間除以","的餘數非"],
        placeholders: ["XX", "XX"],
    },
    'pivot_eq': {
        param_labels: ["時間"],
        param_types: ["time"],
        label: ["基準時間等於"],
        placeholders: ["X:XX"],
    },
    'pivot_less': {
        param_labels: ["時間"],
        param_types: ["time"],
        label: ["基準時間早於"],
        placeholders: ["X:XX"],
    },
    'pivot_less_eq': {
        param_labels: ["時間"],
        param_types: ["time"],
        label: ["基準時間早於或等於"],
        placeholders: ["X:XX"],
    },
    'pivot_greater': {
        param_labels: ["時間"],
        param_types: ["time"],
        label: ["基準時間晚於"],
        placeholders: ["X:XX"],
    },
    'pivot_greater_eq': {
        param_labels: ["時間"],
        param_types: ["time"],
        label: ["基準時間晚於或等於"],
        placeholders: ["X:XX"],
    },
    'pivot_between': {
        param_labels: ["下限", "上限"],
        param_types: ["time", "time"],
        label: ["基準時間介乎 (而包括) ","與"],
        placeholders: ["X:XX", "X:XX"],
    },
    'pivot_not_between': {
        param_labels: ["下限", "上限"],
        param_types: ["time", "time"],
        label: ["基準時間非介乎 (但包括) ","與"],
        placeholders: ["X:XX", "X:XX"],
    },
    'template_exist': {
        param_labels: ["相對基準時間", "模板", "車站"],
        param_types: ["minsec-rel", "template", "station"],
        label: ["基準時間","有模板","的班次 (於","站)"],
        placeholders: ["XX前/後", "XXX", "XXX"],
    },
    'template_not_exist': {
        param_labels: ["相對基準時間", "模板", "車站"],
        param_types: ["minsec-rel", "template", "station"],
        label: ["基準時間","沒有模板","的班次 (於","站)"],
        placeholders: ["XX前/後", "XXX", "XXX"],
    },
};

exports.rules_param_value_mappers = {
    "minsec": async function(value){
        return $.displayTimeIntervalChinese(value, false);
    },
    "minsec-rel": async function(value){
        return $.displayTimeIntervalChinese(value, true);
    },
    "time": async function(value){
        return $.displayTime(value);
    },
    "template": async function(value, axios){
        var $route = `items/schdraft_templates/${encodeURIComponent(value)}?from_selecter=1`;
        var response = await $.callAPI(axios, 'GET', $route);
        return response.data?.title;
    },
    "station": async function(value, axios){
        var $route = `items/stations/${encodeURIComponent(value)}?from_selecter=1`;
        var response = await $.callAPI(axios, 'GET', $route);
        return response.data?.name_chi;
    },
};

//Input: {rule, param} -> Output: []
async function getRuleDisplay(rule, axios){
    var rule_name = rule.rule;
    var params = rule.param;
    var result = [];
    for (var i in params){
        result.push(exports.rules[rule_name]?.label?.[i]);
        if (params?.[i] == null) result.push('??');
        else{
            var param_type = exports.rules[rule_name]?.param_types?.[i];
            var func = exports.rules_param_value_mappers?.[param_type];
            var value = await func?.(params[i], axios);
            result.push(value);
        }
    }
    result.push(exports.rules[rule_name]?.label?.[i-(-1)]);
    return result;
};
exports.getRuleDisplay = getRuleDisplay;

exports.getRuleOptionLabel = function(rule){
    var result = [];
    for (var i in rule.label){
        result.push(rule.label?.[i]);
        result.push(rule.placeholders?.[i] || '');
    }
    return result.join('');
};