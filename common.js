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

//Get One Item by calling GET items/{type}/{id}
function getFields(input){
    if (!input) return '*';
    if (!Array.isArray(input)) return 'id,' + input;
    return 'id,' + input.join(',');
}

//getItems() To be removed after fixing map-new-data-handling

//Get All Items of the Same Collection
//- options: fields, filter, search, sort, array, limit, page
//- options2: fields, filter, search, sort, array
// (groupBy is applicable when there is no subType)
async function getItems(axios, type, options = {}, subType, options2 = {}, foreignKey, arrayKey = 'subItems'){
    //Get Items
    var response = await callAPI(axios, "GET", `items/${type}`, {
        fields: getFields(options.fields),
        filter: options.filter,
        search: options.search,
        sort: options.sort || 'id',
        limit: options.limit || -1,
        page: options.page,
    });
    //Get Sub-Items (If Required)
    if (subType && foreignKey){
        var itemsByFKValue = {};
        var response2 = await callAPI(axios, "GET", `items/${subType}`, {
            fields: getFields(options2.fields) + `,${foreignKey}`,
            filter: options2.filter,
            search: options2.search,
            sort: options2.sort || 'id',
            limit: -1,
        });
        if (response2.http_status == 200){
            for (var i in response2.data){
                var FKValue = response2.data[i][foreignKey];
                if (!options2.array){
                    //Array Mode
                    if (!itemsByFKValue[FKValue]) itemsByFKValue[FKValue] = [];
                    itemsByFKValue[FKValue].push(response2.data[i]);
                }else{
                    //Object Mode
                    if (!itemsByFKValue[FKValue]) itemsByFKValue[FKValue] = {};
                    itemsByFKValue[FKValue][response2.data[i].id] = response2.data[i];
                }
            }
            //Put to Mother-Type Items
            for (var i in response.data){
                var id = response.data[i].id;
                if (itemsByFKValue[id]){
                    response.data[i][arrayKey] = itemsByFKValue[id];
                }else{
                    response.data[i][arrayKey] = (!options2.array) ? [] : {};
                }
            }
        }
    }
    //Return Object (ID as Key)
    if (!options.array){
        if (response.http_status != 200) return {};
        var obj = {};
        for (var i in response.data){
            var item = response.data[i];
            obj[item.id] = item;
        }
        return obj;
    }
    //OR Return Array
    if (response.http_status != 200) return [];
    return response.data;
}
exports.getItems = getItems;

//Get Sub-Type items which are Dependent to Mother-type Collection (returns an object with arrays)

//Display signed integer
exports.displaySignedInteger = function(value){
    var val = parseInt(value);
    if (!val) val = 0;
    if (isNaN(val)) return '#!';
    if (!val) return '±0';
    if (val < 0) return '' + val;
    return '+' + val;
}