//Method to Save Token to LocalStorage
exports.saveToken = function(token){
    localStorage.setItem('access_token', token);
};

//Method to Clear Token from LocalStorage
exports.clearToken = function(){
    localStorage.removeItem('access_token');
};

//Method to Obtain Token from LocalStorage
exports.getToken = function(omitBearer = false){
    var bearer = (omitBearer) ? '' : 'Bearer ';
    var accessToken = localStorage.getItem('access_token');
    return (accessToken == null) ? '' : (bearer + accessToken);
};

//Method to Call API and Return Data
async function callAPI(axios, APIMethod, APIRoute, data = {}, tokenRequired = true){
    //Try Calling API
    try {
        //GET Request -> query
        if (APIMethod == 'GET' || APIMethod == 'get'){
            var options = {params: data};
            if (tokenRequired) options.headers = {'Authorization': exports.getToken()};
            var response = await axios.get(APIRoute, options);
        }
        //POST Request -> body
        else if (APIMethod == 'POST' || APIMethod == 'post'){
            var options = {};
            if (tokenRequired) options.headers = {'Authorization': exports.getToken()};
            var response = await axios.post(APIRoute, data, options);
        }
        //PATCH Request -> query
        else if (APIMethod == 'PATCH' || APIMethod == 'patch'){
            var options = {};
            if (tokenRequired) options.headers = {'Authorization': exports.getToken()};
            var response = await axios.patch(APIRoute, data, options);
        }
        //DELETE Request -> query
        else if (APIMethod == 'DELETE' || APIMethod == 'delete'){
            var options = {params: data};
            if (tokenRequired) options.headers = {'Authorization': exports.getToken()};
            var response = await axios.delete(APIRoute, options);
        }
    }
    //Encountering Error
    catch (error){
        if (error.response){
            var status = error.response.status;
            //Return Error Data
            var error_data = error.response.data || {};
            error_data.http_status = status;
            return error_data;
        }else{
            //No Response Error
            return {
                http_status: null,
            };
        }
    }
    //If No Error...
    var data = response.data || {};
    data.http_status = response.status;
    return data;
}
exports.callAPI = callAPI;

//Display Signed
exports.displaySignedNumber = function(value, decimals = 0){
    if (value === null || isNaN(value)) return null;
    if (value === 0) return '±0';
    if (decimals !== null) value = value.toFixed(decimals);
    if (value < 0) return '' + value;
    if (value > 0) return '+' + value;
}

//Value to time display
exports.day_cutoff = 3 * 3600; //3AM

exports.displayTime = function(value, hideSeconds = false, noDayChange = false){
    if (!value) return null;
    if (isNaN(value) || value < 0) return null;
    if (!noDayChange){
        var h = Math.floor(value / 3600) % 24;
    }else{
        var h = Math.floor(value / 3600);
    }
    var m = Math.floor(value / 60) % 60;
    var s = Math.round(value % 60);
    if (hideSeconds){
        return `${h}:${zero(m)}`;
    }
    return `${h}:${zero(m)}:${zero(s)}`;
}

var zero = function(value){
    return (value < 10 ? '0' : '') + value;
}

//Display Time Interval (#h#m#s / #m#s / #s)
exports.displayTimeInterval = function(value, signed = false, forceSeconds = false, noHours = false){
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
    var mark = signed ? '+' : '';
    if (lessThen0) mark = '-';
    if (value < 60){
        return `${s}s`;
    }else if (noHours){
        if (!(value % 60) && !forceSeconds) return `${mark}${h*60+m}m`;
        return `${mark}${h*60+m}m${zero(s)}s`;
    }else if (value < 3600){
        if (!(value % 60) && !forceSeconds) return `${mark}${m}m`;
        return `${mark}${m}m${zero(s)}s`;
    }else{
        if (!(value % 3600) && !forceSeconds) return `${mark}${h}h`;
        if (!(value % 60) && !forceSeconds) return `${mark}${h}h${zero(m)}m`;
        return `${mark}${h}h${zero(m)}m${zero(s)}s`;
    }
}
exports.displayTimeIntervalMMSS = function(value, signed = false){
    return exports.displayTimeInterval(value, signed, true, true);
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

//Display Time Interval Chinese (e.g. x秒 / x分 / x分xx秒 / 前 / 後)
exports.displayTimeIntervalChinese = function(value, relative = false){
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