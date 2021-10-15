const day_cutoff = 3 * 3600; //3AM

var zero = function(value){
    return (value < 10 ? '0' : '') + value;
}

//Template Station Default
exports.template_empty_station = function(){
    return {
        track: null, track_mod: {},
        arrive_time: null, arrive_time_mod: {},
        depart_time: null, depart_time_mod: {},
        pass_time: null, pass_time_mod: {},
    };
}

//Value to seconds display
exports.displaySeconds = function(value){
    if (isNaN(value)) return null;
    var before = false;
    if (value < 0){
        var before = true;
        value = -value;
    }
    var m = Math.floor(value / 60);
    var s = Math.round(value % 60);
    if (m <= 0) return `${s}s`;
    return `${before ? '-' : ''}${m}:${zero(s)}`;
}
exports.displaySecondsAlt = function(value, relative = false){
    if (isNaN(value)) return null;
    var before = false;
    if (value < 0){
        var before = true;
        value = -value;
    }
    var m = Math.floor(value / 60);
    var s = Math.round(value % 60);
    if (m == 0) var m_s = `${s}秒`;
    else if (s == 0) var m_s = `${m}分`;
    else var m_s = `${m}分${zero(s)}秒`;
    if (relative) return m_s + ((before) ? '前' : '後');
    return (before ? '(' : '') + m_s + (before ? ')' : '');
}

//Value to time display
exports.displayTime = function(value, pass = false, hideSeconds = false){
    if (!value && pass) return '↓';
    if (!value) return null;
    if (isNaN(value) || value < 0) return null;
    var h = Math.floor(value / 3600) % 24;
    var m = Math.floor(value / 60) % 60;
    var s = Math.round(value % 60);
    if (hideSeconds){
        return `${h}:${zero(m)}`;
    }
    return `${h}:${zero(m)}:${zero(s)}`;
}

//#h#m#s
exports.displayTimeInterval = function(value){
    if (value === null) return null;
    if (isNaN(value)) return null;
    var lessThen0 = false;
    if (value < 0){
        lessThen0 = true;
        value = -value;
    }
    value = Math.round(value);
    var h = Math.round(Math.floor(value / 3600));
    var m = Math.round(Math.floor(value / 60) % 60);
    var s = Math.round(value % 60);
    var mark = '';
    if (lessThen0) mark = '-';
    if (value < 60){
        return `${s}s`;
    }else if (value < 3600){
        if (!(value % 60)) return `${mark}${m}m`;
        return `${mark}${m}m${zero(s)}s`;
    }else{
        if (!(value % 3600)) return `${mark}${h}h`;
        if (!(value % 60)) return `${mark}${h}h${zero(m)}m`;
        return `${mark}${h}h${zero(m)}m${zero(s)}s`;
    }
}

//#### (mmss)
exports.displayTimeIntervalAlt = function(a = 0, b = 0){
    if (a === null || b === null) return '-';
    if (isNaN(a) || isNaN(b)) return '-';
    var value = a - b;
    if (value < 0) return '-';
    value = Math.round(value);
    var m = Math.round(Math.floor(value / 60));
    var s = Math.round(value % 60);
    if (value < 60){
        return `${s}s`;
    }else{
        return `${m}${zero(s)}`;
    }
}

//String to time value
exports.getTimeValue = function(string, originalValue, prevValue = null, nextValue = null){
    //If null, reject
    if (string === null || string === "undefined" || string === ""){
        return  null;
    }
    //Check first character
    var firstChar = string.substr(0, 1);
    //If number, it is a time string
    if (firstChar >= "0" && firstChar <= "9"){
        string = string.replace(/\D/g,'');
        switch (string.length){
            case 1: //H
                var value = string.substr(0, 1) * 3600;
                break;
            case 2: //HH
                var value = string.substr(0, 2) * 3600;
                break;
            case 3: //HMM
                var value = string.substr(0, 1) * 3600 + string.substr(1, 2) * 60;
                break;
            case 4: //HHMM
                var value = string.substr(0, 2) * 3600 + string.substr(2, 2) * 60;
                break;
            case 5: //HMMSS
                var value = string.substr(0, 1) * 3600 + string.substr(1, 2) * 60 + string.substr(3, 2) * 1;
                break;
            default: //HHMMSS
                var value = string.substr(0, 2) * 3600 + string.substr(2, 2) * 60 + string.substr(4, 2) * 1;
        }
    }
    //Otherwise...
    else{
        //If "-", subtract from next value
        //Otherwise, add from prev value
        var isMinus = (firstChar == '-');
        if (isMinus && !nextValue) return originalValue;
        if (!isMinus && !prevValue) return originalValue;
        //Check string
        string = string.replace(/\D/g,'');
        switch (string.length){
            case 0: //Invalid
            return originalValue;
            case 1: //S
                var delta = string.substr(0, 1) * 1;
                break;
            case 2: //SS
                var delta = string.substr(0, 2) * 1;
                break;
            case 3: //MSS
                var delta = string.substr(0, 1) * 60 + string.substr(1, 2) * 1;
                break;
            case 4: //MMSS
                var delta = string.substr(0, 2) * 60 + string.substr(2, 2) * 1;
                break;
            case 5: //HMMSS
                var delta = string.substr(0, 1) * 3600 + string.substr(1, 2) * 60 + string.substr(3, 2) * 1;
                break;
            default: //HHMMSS
                var delta = string.substr(0, 2) * 3600 + string.substr(2, 2) * 60 + string.substr(4, 2) * 1;
        }
        //Obtain Value
        if (isMinus){
            var value = nextValue - delta;
        }else{
            var value = prevValue + delta;
        }
    }
    //Cap range
    return (value - day_cutoff) % 86400 + day_cutoff;
}

/**
 * Calculate minimum travel time
 */
exports.MAX_SPEED_STAY_TIME = 5;
exports.minTravelTime = function(line, section, performance,
isUpbound, isExpress, isPassPrev, isPassNext){

    var dist_m = section.distance_km * 1000;
    var by_kph = performance?.calc_results_by_kph || [];
    var max_speed = Math.min(
        (performance?.max_speed_kph || Infinity) * 1,
        (line?.max_speed_kph || Infinity) * 1,
        (section?.max_speed_kph || Infinity) * 1,
    );;
    var accel_factor = isPassPrev ? 0 : 1;
    var decel_factor = isPassNext ? 0 : 1;

    //Determine additional time
    var additional_time_s = 0;
    var additional_time = section.additional_time || {};
    if (true)           additional_time_s += (additional_time.basic * 1 || 0);
    if (isUpbound)      additional_time_s += (additional_time.upbound * 1 || 0);
    else                additional_time_s += (additional_time.downbound * 1 || 0);
    if (isExpress)      additional_time_s += (additional_time.express * 1 || 0);
    else                additional_time_s += (additional_time.local * 1 || 0);
    if (isUpbound ? isPassNext : isPassPrev)    additional_time_s += (additional_time.stop_up * 1 || 0);
    else                                        additional_time_s += (additional_time.pass_up * 1 || 0);
    if (!isUpbound ? isPassNext : isPassPrev)   additional_time_s += (additional_time.stop_down * 1 || 0);
    else                                        additional_time_s += (additional_time.pass_down * 1 || 0);

    if (!isPassPrev) additional_time_s += (performance.depart_additional_time_s * 1 || 0);

    //Determine Min Travel Time caring stay time
    while (max_speed > 0){
        var max_speed_stay_dist = dist_m
        - by_kph[max_speed].accel_dist * accel_factor
        - by_kph[max_speed].decel_dist * decel_factor;
        var max_speed_stay_time = max_speed_stay_dist / max_speed * 3.6;
        if (max_speed_stay_time > exports.MAX_SPEED_STAY_TIME){
            return max_speed_stay_time
            + by_kph[max_speed].accel_time * accel_factor
            + by_kph[max_speed].decel_time * decel_factor
            + additional_time_s;
        }
        max_speed--;
    }
    return Infinity;
}