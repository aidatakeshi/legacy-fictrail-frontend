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

//Display signed integer
exports.displaySignedInteger = function(value){
    var val = parseInt(value);
    if (!val) val = 0;
    if (isNaN(val)) return '#!';
    if (!val) return '±0';
    if (val < 0) return '' + val;
    return '+' + val;
}