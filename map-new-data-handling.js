const $ = require('~/common.js');
const config = require('~/map-new-config.js');

//Load All Data
async function loadAll($this, axios){
    $this.status_loading = "正在載入營運者資料...";
    await loadOperators($this, axios);
    $this.status_loading = "正在載入都省府縣資料...";
    await loadPrefectures($this, axios);
    $this.status_loading = "正在載入路線資料...";
    await loadLines($this, axios);
    $this.status_loading = "正在載入車站資料...";
    await loadStations($this, axios);
    $this.status_loading = null;

};
exports.loadAll = loadAll;

/**
 * Lines
 */
async function loadLines($this, axios){ //To be modified, don't use getItems()
    //Line Types
    $this.data_line_types = await $.getItems(axios, "line_types", {
        fields: 'id,name_chi,name_eng,major,color',
        sort: 'sort',
    });
    for (var id in $this.data_line_types){
        $this.data_line_types[id].line_ids = [];
        $this.line_type_ids.push(id);
        $this.line_type_ids_reversed.unshift(id);
    }
    //Lines & Line-Stations
    $this.data_lines = await $.getItems(axios, "lines", {
        sort: 'name_eng',
    }, 'lines_stations', {
        sort: 'sort',
    }, 'line_id', 'stations');
    for (var i in $this.data_lines){
        var line = $this.data_lines[i];
        $this.data_line_types[line.line_type_id].line_ids.push(line.id);
    }
    //Fill x1, x2, y1, y2 in segments (i.e. $this.data_lines[id].stations[i].segments[j][type])
    for (var id in $this.data_lines){
        for (var i in $this.data_lines[id].stations){
            for (var j in $this.data_lines[id].stations[i].segments){
                for (var type of ['x1', 'x2', 'y1', 'y2']){
                    if ($this.data_lines[id].stations[i].segments[j][type] === undefined){
                        $this.data_lines[id].stations[i].segments[j][type] = null;
                    }
                }
            }
        }
    }
};
exports.loadLines = loadLines;

/**
 * Stations
 */
async function loadStations($this, axios){
    var response = await $.callAPI(axios, 'GET', `items/stations?limit=-1`);
    if (response.http_status != 200) return false;
    for (var i in response.data){
        $this.data_stations[response.data[i].id] = response.data[i];
    }
};
exports.loadStations = loadStations;

/**
 * Prefectures
 */
async function loadPrefectures($this, axios){
    var response = await $.callAPI(axios, 'GET', `items/prefectures?limit=-1`, {
        fields: 'id,name_chi,name_chi_suffix',
    });
    if (response.http_status != 200) return false;
    for (var i in response.data){
        $this.data_prefectures[response.data[i].id] = response.data[i];
    }
};
exports.loadPrefectures = loadPrefectures;

/**
 * Operators
 */
async function loadOperators($this, axios){
    $this.data_operators = {};
    var response = await $.callAPI(axios, 'GET', `items/operators?limit=-1`, {
        fields: 'id,name_chi,color',
    });
    if (response.http_status != 200) return false;
    for (var i in response.data){
        $this.data_operators[response.data[i].id] = response.data[i];
    }
};
exports.loadOperators = loadOperators;

/**
 * Save Line Section Data
 * matters to handle: unsaved_segments, unsaved_mileage, to_remove, id, sort
 */
async function saveLineSectionsData(line$, axios){
    //Remove Unwanted Items
    for (var i = line$.stations.length - 1; i >= 0; i--){
        var section = line$.stations[i];
        if (section.to_remove){
            if (section.id){
                var response = await $.callAPI(axios, 'DELETE', `items/lines_stations/${encodeURI(section.id)}`);
                if (response.http_status != 200) return false;
            }
            line$.stations.splice(i, 1);
        }
    }
    //Save New Data
    for (var i in line$.stations){
        var section = line$.stations[i];
        if (!section.id){
            section.sort = i;
            var response = await $.callAPI(axios, 'POST', `items/lines_stations`, section);
            if (response.http_status != 200) return false;
            line$.stations[i].id = response.data.id;
            line$.stations[i].sort = i;
            line$.stations[i].unsaved_segments = false;
            line$.stations[i].unsaved_mileage = false;
            line$.stations[i].unsaved_station = false;
        }
    }
    //Update Data
    for (var i in line$.stations){
        var section = line$.stations[i];
        var data = {};
        //segments
        if (section.unsaved_segments){
            data.segments = section.segments;
        }
        //distance_km, mileage_km
        if (section.unsaved_mileage){
            data.distance_km = section.distance_km;
            data.mileage_km = section.mileage_km;
        }
        //sort
        if (section.sort != i){
            data.sort = i;
        }
        //station_id
        if (section.unsaved_station){
            data.station_id = section.station_id;
        }
        //...
        if (Object.keys(data).length){
            var response = await $.callAPI(axios, 'PATCH', `items/lines_stations/${encodeURI(section.id)}`, data);
            if (response.http_status != 200) return false;
            line$.stations[i].sort = i;
            line$.stations[i].unsaved_segments = false;
            line$.stations[i].unsaved_mileage = false;
            line$.stations[i].unsaved_station = false;
        }
    }
    //Update length_km of Line
    var length_km = line$.stations[line$.stations.length - 1]?.mileage_km;
    if (line$.length_km != length_km){
        var response = await $.callAPI(axios, 'PATCH', `items/lines/${encodeURI(line$.id)}`, {length_km});
    }
    line$.length_km = length_km;
}
exports.saveLineSectionsData = saveLineSectionsData;

/**
 * Update Line Bounding Box
 */
async function updateLineBoundingBox(line$, axios){
    var x_min = null;
    var x_max = null;
    var y_min = null;
    var y_max = null;
    for (var i in line$.stations){
        for (var j in line$.stations[i].segments){
            var segment = line$.stations[i].segments[j];
            var x = [
                segment.x - 0,
                segment.x - (-segment.x1 || 0),
                segment.x - (segment.x2 || 0),
            ];
            for (var n in x){
                if (x_min === null || x_min > x[n]) x_min = x[n];
                if (x_max === null || x_max < x[n]) x_max = x[n];
            }
            var y = [
                segment.y - 0,
                segment.y - (-segment.y1 || 0),
                segment.y - (segment.y2 || 0),
            ];
            for (var n in y){
                if (y_min === null || y_min > y[n]) y_min = y[n];
                if (y_max === null || y_max < y[n]) y_max = y[n];
            }
        }
    }
    //Update bounding box of line
    line$.x_min = (x_min = Math.floor(x_min));
    line$.x_max = (x_max = Math.ceil(x_max));
    line$.y_min = (y_min = Math.floor(y_min));
    line$.y_max = (y_max = Math.ceil(y_max));
    var response = await $.callAPI(axios, 'PATCH', `items/lines/${encodeURI(line$.id)}`, {
        x_min, x_max, y_min, y_max
    });
}
exports.updateLineBoundingBox = updateLineBoundingBox;

/**
 * Reverse Line
 */
exports.reverseLine = function(line$){
    //Reverse Sections
    if (!line$?.stations?.length) return false;
    line$.stations.reverse();

    //Shift segments data to the next section
    for (var i = line$.stations.length - 1; i >= 1; i--){
        var segments = JSON.parse(JSON.stringify(line$.stations[i-1].segments));
        line$.stations[i].segments = segments;
        //Reverse segments as well
        line$.stations[i].segments.reverse();
        for (var j in line$.stations[i].segments){
            //Swap x1, y1, x2, y2
            var tempx = line$.stations[i].segments[j].x1;
            line$.stations[i].segments[j].x1 = line$.stations[i].segments[j].x2;
            line$.stations[i].segments[j].x2 = tempx;
            var tempy = line$.stations[i].segments[j].y1;
            line$.stations[i].segments[j].y1 = line$.stations[i].segments[j].y2;
            line$.stations[i].segments[j].y2 = tempy;
        }
    }
    
    //Clear segments of first section
    line$.stations[0].segments = [];

    //Mark as unsaved
    for (var i in line$.stations){
        line$.stations[i].unsaved_segments = true;
        line$.stations[i].unsaved_station = true;
    }
}