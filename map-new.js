const $ = require('~/common.js');
const config = require('~/map-new-config.js');
const calc = require('~/map-new-calc.js');

//General Functions

function numbersValid(nums){
    for (var i in nums){
        if (nums[i] === null) return false;
        if (nums[i] === undefined) return false;
        if (isNaN(nums[i])) return false;
    }
    return true;
}
function pyth(x, y){
    return Math.sqrt(x*x+y*y);
}
function binomial4(a1, a2, a3, a4, n, isReversed = false){
    var m = 1 - n;
    if (!isReversed){
        return [null,
            a1,
            a1*n + a2*m,
            a1*n*n + a2*m*n*2 + a3*m*m,
            a1*n*n*n + a2*m*n*n*3 + a3*m*m*n*3 + a4*m*m*m,
        ];
    }else{
        return [null,
            a4*m*m*m + a3*m*m*n*3 + a2*m*n*n*3 + a1*n*n*n,
            a4*m*m + a3*m*n*2 + a2*n*n,
            a4*m + a3*n,
            a4,
        ];
    }
};

/**
 * Initialization & LocalStorage
 */

exports.loadLocalStorage = function($this){
    if (localStorage){
        if (localStorage.getItem('map-displayRefMap') == 'true') $this.displayRefMap = true;
        if (localStorage.getItem('map-displayCompass') == 'true') $this.displayCompass = true;
        if (localStorage.getItem('map-showOverlay') == 'true') $this.showOverlay = true;
        var val = localStorage.getItem('map-xpos');
        if (isFinite(val) && val !== null) $this.xpos = parseFloat(val);
        var val = localStorage.getItem('map-ypos');
        if (isFinite(val) && val !== null) $this.ypos = parseFloat(val);
        var val = localStorage.getItem('map-zoom');
        if (isFinite(val) && val !== null) $this.zoom = parseFloat(val);
    }
};

exports.saveLocalStorage = function($this){
    localStorage.setItem('map-displayRefMap', $this.displayRefMap);
    localStorage.setItem('map-displayCompass', $this.displayCompass);
    localStorage.setItem('map-xpos', $this.xpos);
    localStorage.setItem('map-ypos', $this.ypos);
    localStorage.setItem('map-zoom', $this.zoom);
    localStorage.setItem('map-showOverlay', $this.showOverlay);
};

exports.initializeListeners = function($this){
    if (typeof window !== 'undefined'){
        window.addEventListener('resize', $this.handleScreenResized);
        window.addEventListener('keydown', $this.handleKeyDown);
        window.addEventListener('keyup', $this.handleKeyUp);
    }
};

exports.removeListeners = function($this){
    if (typeof window !== 'undefined'){
        window.removeEventListener('resize', $this.handleScreenResized);
        window.removeEventListener('keydown', $this.handleKeyDown);
        window.removeEventListener('keyup', $this.handleKeyUp);
    }
};

/**
 * Map Display
 */

exports.constraintBaseMapTransformation = function($this, target = null){
    //zoom
    if ($this.zoom > config.zoom_max) $this.zoom = config.zoom_max;
    else{
        var a = $this.screenWidth / config.map_width;
        var b = $this.screenHeight / config.map_height;
        var zoom_min = Math.max(a, b);
        if ($this.zoom < zoom_min) $this.zoom = zoom_min;
    }
    //xpos, ypos
    var xpos_min = $this.screenWidth / 2 / config.map_width / $this.zoom;
    var ypos_min = $this.screenHeight / 2 / config.map_height / $this.zoom;
    if ($this.xpos < xpos_min) $this.xpos = xpos_min;
    else if ($this.xpos > 1 - xpos_min) $this.xpos = 1 - xpos_min;
    if ($this.ypos < ypos_min) $this.ypos = ypos_min;
    else if ($this.ypos > 1 - ypos_min) $this.ypos = 1 - ypos_min;
    //Adjust xpos, ypos
    if (target){
        target.setAttr('x', $this.screenWidth / 2 - $this.xpos * config.map_width * $this.zoom);
        target.setAttr('y', $this.screenHeight / 2 - $this.ypos * config.map_height * $this.zoom);
    }
    //Redraw
    $this.draw();
};

/**
 * Key Press Handling
 */

exports.keyDownMoveStation = function($this, keyCode){

};

exports.keyDownMoveLineControlPoint = function($this, keyCode){

};

/**
 * Position Conversion
 * input should contain {xpos, ypos, zoom, screenWidth, screenHeight}
 * returns {x, y}
 */
exports.getXYFromClickEvent = function($event, $this){
    var x = $event?.evt?.clientX || $event?.evt?.touches[0]?.clientX;
    var y = $event?.evt?.clientY || $event?.evt?.touches[0]?.clientY;
    if (x === null || y === null || x === undefined || y === undefined){
        return {x: null, y: null};
    }
    var mapX = config.map_width * $this.xpos + (x - $this.screenWidth / 2) / $this.zoom;
    var mapY = config.map_height * $this.ypos + (y - $this.screenHeight / 2) /$this.zoom;
    return {x: mapX, y: mapY};
};

/**
 * Station Tooltip
 */
exports.getStationTooltip = function($this, id){
    var arr = [];
    var station = $this.data_stations[id] || {};
    arr.push(`${station.name_chi}`);
    arr.push(`${station.name_eng}`);
    var prefecture = $this.data_prefectures[station.prefecture_id] || {};
    var operator = $this.data_operators[station.operator_id] || {};
    arr.push(`${prefecture.name_chi}${prefecture.name_chi_suffix} / ${operator.name_chi}`);
    if (station.height_m){
        arr.push(`(▲${station.height_m}m)`);
    }
    return arr;
};

/**
 * Detect Line Section, Segment & Proportion from X, Y
 */
exports.getLineProportion = function($event, $this, sections, section_index, segment_index){
    if (!sections) return null;
    var segment1 = sections?.[section_index]?.segments?.[segment_index-1];
    var segment2 = sections?.[section_index]?.segments?.[segment_index];
    if (!segment1 || !segment2) return null;

    //Get click xy
    var {x, y} = exports.getXYFromClickEvent($event, $this);

    //Define four control points (xy0, xy1, xy2, x3y3)
    var x0 = segment1.x;        var y0 = segment1.y;
    var x1 = segment1.x1;       var y1 = segment1.y1;
    var x2 = segment2.x2;       var y2 = segment2.y2;
    var x3 = segment2.x;        var y3 = segment2.y;
    var isBezier = numbersValid([x1, y1, x2, y2]);

    //Straight
    if (!isBezier){
        return getLineProportion_Straight(x, y, x0, y0, x3, y3, 0, 1);
    }
    //Bezier
    else{
        x1 += x0; y1 += y0; x2 += x3; y2 += y3;
        return getLineProportion_Bezier(x, y, x0, y0, x1, y1, x2, y2, x3, y3, 0, 1);
    }
};

const getLineProportionThreshold = 0.01;

function getLineProportion_Bezier(x, y, x0, y0, x1, y1, x2, y2, x3, y3, a, b){
    var oma = 1 - a; var omb = 1 - b;
    var xa = x3*a*a*a + 3*x2*a*a*oma + 3*x1*a*oma*oma + x0*oma*oma*oma;
    var xb = x3*b*b*b + 3*x2*b*b*omb + 3*x1*b*omb*omb + x0*omb*omb*omb;
    var ya = y3*a*a*a + 3*y2*a*a*oma + 3*y1*a*oma*oma + y0*oma*oma*oma;
    var yb = y3*b*b*b + 3*y2*b*b*omb + 3*y1*b*omb*omb + y0*omb*omb*omb;
    var dista = pyth(x - xa, y - ya);
    var distb = pyth(x - xb, y - yb);
    //Less then Threshold -> Result
    if (isNaN(dista) || isNaN(distb) || dista === null || distb === null) return null;
    if (Math.abs(dista - distb) <= getLineProportionThreshold){
        return (a + b) / 2;
    }
    //Otherwise, Iterate
    if (dista < distb){
        return getLineProportion_Bezier(x, y, x0, y0, x1, y1, x2, y2, x3, y3, a, (a+b)/2);
    }else{
        return getLineProportion_Bezier(x, y, x0, y0, x1, y1, x2, y2, x3, y3, (a+b)/2, b);
    }
}

function getLineProportion_Straight(x, y, x0, y0, x3, y3, a, b){
    var xa = x0 * 1 + (x3 - x0) * a;
    var ya = y0 * 1 + (y3 - y0) * a;
    var xb = x0 * 1 + (x3 - x0) * b;
    var yb = y0 * 1 + (y3 - y0) * b;
    var dista = pyth(x - xa, y - ya);
    var distb = pyth(x - xb, y - yb);
    //Less then Threshold -> Result
    if (isNaN(dista) || isNaN(distb) || dista === null || distb === null) return null;
    if (Math.abs(dista - distb) <= getLineProportionThreshold){
        return (a + b) / 2;
    }
    //Otherwise, Iterate
    if (dista < distb){
        return getLineProportion_Straight(x, y, x0, y0, x3, y3, a, (a+b)/2);
    }else{
        return getLineProportion_Straight(x, y, x0, y0, x3, y3, (a+b)/2, b);
    }
}

/**
 * Update Mileage
 */
exports.updateMileage = function(sections){
    var mileage_cum = 0;
    sections[0].mileage_km = 0;
    sections[0].distance_km = 0;
    for (var i = 1; i < sections.length; i++){
        mileage_cum += calc.getLengthOfSection(sections[i]);
        var new_value = mileage_cum.toFixed(config.mileage_decimals);
        if (sections[i].mileage_km != new_value) sections[i].unsaved_mileage = true;
        sections[i].mileage_km = new_value;
    }
    for (var i = 1; i < sections.length; i++){
        var a = sections[i].mileage_km;
        var b = sections[i-1].mileage_km;
        var new_value = (a - b).toFixed(config.mileage_decimals);
        if (sections[i].distance_km != new_value) sections[i].unsaved_mileage = true;
        sections[i].distance_km = new_value;
    }
}

async function saveStationLocation($this, axios, station_id, x, y){
    var response = await $.callAPI(axios, 'PATCH', `items/stations/${station_id}`, {
        x: x, y: y
    });
    if (response.http_status >= 400){
        $this.$bvToast.toast('新位置儲存失敗', { title: '車站', variant: 'danger' });
    }
}
exports.saveStationLocation = saveStationLocation;

/**
 * Check if Line Segment is Bezier
 */
exports.isBezierCurve = function(point1, point2){
    return numbersValid([
        point1?.x1, point1?.y1, point2?.x2, point2?.y2,
    ]);
}

/**
 * Adjust Line with Adjacent Segment
 * meOnlyIsOppo = true: only changes x2, y2 of that point; meOnlyIsOppo = false: only changes x1, y1 of that point
 */
exports.adjustWithAdjacentSegment = function(sections, section_i, segment_i, cp_id, meOnlyIsOppo = null){
    
    //Prev segment point: prev2|prev ; This segment point: oppo|prev ; Next segment point: next|next2
    var section_this = section_i;
    var segment_this = segment_i;
    var x = sections[section_this]?.segments?.[segment_this]?.x;
    var y = sections[section_this]?.segments?.[segment_this]?.y;

    var section_oppo = section_this; var segment_oppo = segment_this;
    if (segment_this >= (sections[section_this]?.segments||[]).length - 1){
        section_this = getNextSection(sections, section_this);
        segment_this = 0;
    }else if (segment_this == 0){
        section_oppo = getPrevSection(sections, section_oppo);
        segment_oppo = (sections[section_oppo]?.segments||[]).length - 1;
    }

    //Check previous segment exists and whether it is bezier curve
    var section_prev = section_oppo; var segment_prev = segment_oppo - 1;
    if (segment_prev < 0){
        section_prev = getPrevSection(sections, section_prev);
        segment_prev = (sections[section_prev]?.segments||[]).length - 1;
    }
    var section_prev2 = section_prev; var segment_prev2 = segment_prev;
    if (segment_prev2 == 0){
        section_prev2 = getPrevSection(sections, section_prev2);
        segment_prev2 = (sections[section_prev2]?.segments||[]).length - 1;
    }
    var x2 = sections[section_oppo]?.segments?.[segment_oppo]?.x2;
    var y2 = sections[section_oppo]?.segments?.[segment_oppo]?.y2;
    var x_prev = sections[section_prev]?.segments?.[segment_prev]?.x;
    var y_prev = sections[section_prev]?.segments?.[segment_prev]?.y;
    var x1_prev = sections[section_prev]?.segments?.[segment_prev]?.x1;
    var y1_prev = sections[section_prev]?.segments?.[segment_prev]?.y1;
    var x2_prev = sections[section_prev2]?.segments?.[segment_prev2]?.x2;
    var y2_prev = sections[section_prev2]?.segments?.[segment_prev2]?.y2;
    if (numbersValid([x1_prev, y1_prev, x2, y2])){
        var isPrevSegmentBezier = true;
    }else if (numbersValid([x_prev, y_prev, x, y])){
        var isPrevSegmentBezier = false;
    }else{
        var isPrevSegmentBezier = null;
    }

    //Check next segment exists and whether it is bezier curve
    var section_next = section_this; var segment_next = segment_this + 1;
    if (segment_next > (sections[section_next]?.segments||[]).length - 1){
        section_next = getNextSection(sections, section_next);
        segment_next = 0;
    }
    var section_next2 = section_next; var segment_next2 = segment_next;
    if (segment_next2 >= (sections[section_next2]?.segments||[]).length - 1){
        section_next2 = getNextSection(sections, section_next2);
        segment_next2 = 0;
    }
    var x1 = sections[section_this]?.segments?.[segment_this]?.x1;
    var y1 = sections[section_this]?.segments?.[segment_this]?.y1;
    var x_next = sections[section_next2]?.segments?.[segment_next2]?.x
        || sections[section_next]?.segments?.[segment_next]?.x;
    var y_next = sections[section_next2]?.segments?.[segment_next2]?.y
        || sections[section_next]?.segments?.[segment_next]?.y;
    var x2_next = sections[section_next]?.segments?.[segment_next]?.x2;
    var y2_next = sections[section_next]?.segments?.[segment_next]?.y2;
    var x1_next = sections[section_next2]?.segments?.[segment_next2]?.x1;
    var y1_next = sections[section_next2]?.segments?.[segment_next2]?.y1;
    if (numbersValid([x2_next, y2_next, x1, y1])){
        var isNextSegmentBezier = true;
    }else if (numbersValid([x_next, y_next, x, y])){
        var isNextSegmentBezier = false;
    }else{
        var isNextSegmentBezier = null;
    }

    //Handle Section / Segment Point (x, y)
    if (!cp_id){
        //Case 1: (x, y) moved; The prev segment is curve while the next segment is straight
        //--> Move x2, y2 of that segment point; Move x1, y1 of the next segment point
        if (isPrevSegmentBezier === true && isNextSegmentBezier === false){
            if (meOnlyIsOppo !== false){
                var x2y2length = pyth(x2, y2);
                var dx = x_next - x; var dy = y_next - y; var dxdylength = pyth(dx, dy);
                sections[section_oppo].segments[segment_oppo].x2 = -dx / dxdylength * x2y2length;
                sections[section_oppo].segments[segment_oppo].y2 = -dy / dxdylength * x2y2length;
            }
            //
            if (meOnlyIsOppo === null && numbersValid([x1_next, y1_next])){
                var x1y1length = pyth(x1_next, y1_next);
                sections[section_next2].segments[segment_next2].x1 = dx / dxdylength * x1y1length;
                sections[section_next2].segments[segment_next2].y1 = dy / dxdylength * x1y1length;
                //
                sections[section_next2].unsaved_segments = true;
            }
        }
        //Case 2: (x, y) moved; The prev segment is straight while the next segment is curve
        //--> Move x1, y1 of that segment point; Move x2, y2 of the prev segment point
        else if (isPrevSegmentBezier === false && isNextSegmentBezier === true){
            if (meOnlyIsOppo !== true){
                var x1y1length = pyth(x1, y1);
                var dx = x_prev - x; var dy = y_prev - y; var dxdylength = pyth(dx, dy);
                sections[section_this].segments[segment_this].x1 = -dx / dxdylength * x1y1length;
                sections[section_this].segments[segment_this].y1 = -dy / dxdylength * x1y1length;
            }
            //
            if (meOnlyIsOppo === null && numbersValid([x2_prev, y2_prev])){
                var x2y2length = pyth(x2_prev, y2_prev);
                sections[section_prev2].segments[segment_prev2].x2 = dx / dxdylength * x2y2length;
                sections[section_prev2].segments[segment_prev2].y2 = dy / dxdylength * x2y2length;
                //
                sections[section_prev2].unsaved_segments = true;
            }
        }
        //Case 3: (x, y) moved; Both the prev & next segments are straight
        //--> Move x2, y2 of the prev segment point; Move x1, y1 of the next segment point
        else if (isPrevSegmentBezier === false && isNextSegmentBezier === false){
            if (meOnlyIsOppo === null && numbersValid([x1_next, y1_next])){
                var x2y2length = pyth(x2, y2);
                var dx = x_next - x; var dy = y_next - y; var dxdylength = pyth(dx, dy);
                var x1y1length = pyth(x1_next, y1_next);
                sections[section_next2].segments[segment_next2].x1 = dx / dxdylength * x1y1length;
                sections[section_next2].segments[segment_next2].y1 = dy / dxdylength * x1y1length;
                //
                sections[section_next2].unsaved_segments = true;
            }
            //
            if (meOnlyIsOppo === null && numbersValid([x2_prev, y2_prev])){
                var x1y1length = pyth(x1, y1);
                var dx = x_prev - x; var dy = y_prev - y; var dxdylength = pyth(dx, dy);
                var x2y2length = pyth(x2_prev, y2_prev);
                sections[section_prev2].segments[segment_prev2].x2 = dx / dxdylength * x2y2length;
                sections[section_prev2].segments[segment_prev2].y2 = dy / dxdylength * x2y2length;
                //
                sections[section_prev2].unsaved_segments = true;
            }
        }
    }

    //Handle Bezier Control Point (x1, y1)
    else if (cp_id == 1){
        //Case 4: (x1, y1) moved; The prev segment is straight
        //--> Move x1, y1 of that segment point
        if (meOnlyIsOppo !== true && isPrevSegmentBezier === false){
            var x1y1length = pyth(x1, y1);
            var dx = x_prev - x; var dy = y_prev - y; var dxdylength = pyth(dx, dy);
            sections[section_this].segments[segment_this].x1 = -dx / dxdylength * x1y1length;
            sections[section_this].segments[segment_this].y1 = -dy / dxdylength * x1y1length;
            //
            sections[section_this].unsaved_segments = true;
        }
        //Case 5: (x1, y1) moved; The prev segment is curve
        //--> Move x2, y2 of that segment point
        else if (meOnlyIsOppo !== false && isPrevSegmentBezier === true){
            var x2y2length = pyth(x2, y2);
            var x1y1length = pyth(x1, y1);
            sections[section_oppo].segments[segment_oppo].x2 = -x1 / x1y1length * x2y2length;
            sections[section_oppo].segments[segment_oppo].y2 = -y1 / x1y1length * x2y2length;
            //
            sections[section_oppo].unsaved_segments = true;
        }
    }

    //Handle Bezier Control Point (x2, y2)
    else if (cp_id == 2){
        //Case 6:(x2, y2) moved; The next segment is straight
        //--> Move x2, y2 of that segment point
        if (meOnlyIsOppo !== false && isNextSegmentBezier === false){
            var x2y2length = pyth(x2, y2);
            var dx = x_next - x; var dy = y_next - y; var dxdylength = pyth(dx, dy);
            sections[section_oppo].segments[segment_oppo].x2 = -dx / dxdylength * x2y2length;
            sections[section_oppo].segments[segment_oppo].y2 = -dy / dxdylength * x2y2length;
            //
            sections[section_oppo].unsaved_segments = true;
        }
    
        //Case 7: (x2, y2) moved; The next segment is curve
        //--> Move x1, y1 of that segment point
        if (meOnlyIsOppo !== true && isNextSegmentBezier === true){
            var x1y1length = pyth(x1, y1);
            var x2y2length = pyth(x2, y2);
            sections[section_this].segments[segment_this].x1 = -x2 / x2y2length * x1y1length;
            sections[section_this].segments[segment_this].y1 = -y2 / x2y2length * x1y1length;
            //
            sections[section_this].unsaved_segments = true;
        }
    }

    //Update Mileage
    exports.updateMileage(sections);
}

function getPrevSection(sections, section_i = null){
    if (section_i < 0 && section_i !== null) return -1;
    if (section_i === null) section_i = sections.length;
    for (var i = section_i-1; i >= 0; i--){
        if (!sections[i].to_remove) return i;
    }
    return -1;
}
function getNextSection(sections, section_i = null){
    if (section_i < 0 && section_i !== null) return -1;
    if (section_i === null) section_i = -1;
    for (var i = section_i+1; i < sections.length; i++){
        if (!sections[i].to_remove) return i;
    }
    return -1;
}

/**
 * Other Line Operations
 */
exports.lineAppendSection = function(line_id, sections, station_id, isBefore, dataStations){
    //First Item?
    if (!sections.length){
        sections.push({
            id: null,
            sort: 0,
            line_id: line_id,
            station_id: station_id,
            segments: [],
        });
    }
    //Append Before
    else if (isBefore){
        var first = getNextSection(sections);
        var section_next = sections[first];
        if (!section_next) return false;
        if (section_next.to_remove) return false;
        var stationA = station_id;
        if (!section_next?.segments?.length){
            var stationB = section_next.station_id;
            var xB = dataStations[stationB]?.x - 0;    var yB = dataStations[stationB]?.y - 0;
        }else{
            var firstSegment = section_next.segments[0];
            var xB = firstSegment.x;                   var yB = firstSegment.y;
        }
        var xA = dataStations[stationA]?.x - 0;    var yA = dataStations[stationA]?.y - 0;
        sections[first].segments = [
            {x: xA, y: yA, x1: null, y1: null, x2: null, y2: null},
            {x: xB, y: yB, x1: null, y1: null, x2: null, y2: null},
        ];
        sections[first].unsaved_segments = true;
        sections.unshift({
            id: null,
            sort: 0,
            line_id: line_id,
            station_id: stationA,
            segments: [],
        });
    }
    //Append After
    else{
        var section_prev = sections[getPrevSection(sections)];
        if (!section_prev) return false;
        if (section_prev.to_remove) return false;
        var stationB = station_id;
        if (!section_prev?.segments?.length){
            var stationA = section_prev.station_id;
            var xA = dataStations[stationA]?.x - 0;    var yA = dataStations[stationA]?.y - 0;
        }else{
            var last_segment = section_prev.segments[section_prev.segments.length - 1];
            var xA = last_segment.x;                    var yA = last_segment.y;
        }
        var xB = dataStations[stationB]?.x - 0;    var yB = dataStations[stationB]?.y - 0;
        sections.push({
            id: null,
            sort: 0,
            line_id: line_id,
            station_id: stationB,
            segments: [
                {x: xA, y: yA, x1: null, y1: null, x2: null, y2: null},
                {x: xB, y: yB, x1: null, y1: null, x2: null, y2: null},
            ],
        });
    }
    //Update Mileage
    exports.updateMileage(sections);
}

exports.lineRemoveSection = function(sections, isBefore){
    if (isBefore){
        var a = getNextSection(sections);
        var b = getNextSection(sections, a);
        sections[a].to_remove = true;
        sections[b].segments = [];
        sections[b].unsaved_segments = true;
    }else{
        var a = getPrevSection(sections);
        sections[a].to_remove = true;
    }
    //Update Mileage
    exports.updateMileage(sections);
}

exports.lineRemoveSectionMiddle = function(sections, section_index){
    var section_prev = getPrevSection(sections, section_index);
    var section_prev_segments = sections[section_prev].segments;
    var section_prev_segment_last = section_prev_segments[section_prev_segments.length - 1];
    if (!sections?.[section_index]?.segments?.[0]) return false;
    //Copy x1, y1
    if (section_prev_segment_last){
        sections[section_index].segments[0].x2 = section_prev_segment_last.x2 || null;
        sections[section_index].segments[0].y2 = section_prev_segment_last.y2 || null;
    }
    //Copy Other Segments
    for (var i = sections[section_prev].segments.length - 2; i >= 0 ; i--){
        sections[section_index].segments.unshift(sections[section_prev].segments[i]);
    }
    sections[section_index].unsaved_segments = true;
    sections[section_prev].to_remove = true;
    //Update Mileage
    exports.updateMileage(sections);
}

exports.lineInsertSection = function(line_id, sections, station_id, section_index, segment_index){
    sections.splice(section_index, 0, {
        id: null,
        sort: 0,
        line_id: line_id,
        station_id: station_id,
        segments: [],
    });
    for (var i = 0; i <= segment_index; i++){
        sections[section_index].segments.push(sections[section_index + 1].segments[i]);
    }
    for (var i = 0; i < segment_index; i++){
        sections[section_index + 1].segments.shift();
    }
    sections[section_index + 1].unsaved_segments = true;
    //Update Mileage
    exports.updateMileage(sections);
}

exports.lineChangeStation = function(sections, section_index, segment_index, station_id){
    var station_index = section_index - (segment_index == 0 ? 1 : 0);
    sections[station_index].station_id = station_id;
    sections[station_index].unsaved_station = true;
}

exports.lineAlignPointToStation = function(sections, section_index, segment_index, dataStations){
    var station_index = section_index - (segment_index == 0 ? 1 : 0);
    var station_id = sections[station_index].station_id;
    if (!station_id) return false;
    var {x, y} = dataStations[station_id] || {};
    if (x === undefined && y === undefined) return false;
    if (station_index > 0){
        var len = sections?.[station_index]?.segments?.length;
        if (sections?.[station_index]?.segments?.[len - 1]){
            sections[station_index].segments[len - 1].x = x;
            sections[station_index].segments[len - 1].y = y;
            sections[station_index].unsaved_segments = true;
        }
    }
    if (station_index < sections.length - 1){
        if (sections?.[station_index + 1]?.segments?.[0]){
            sections[station_index + 1].segments[0].x = x;
            sections[station_index + 1].segments[0].y = y;
            sections[station_index + 1].unsaved_segments = true;
        }
    }
    //Update Mileage
    exports.updateMileage(sections);
}

exports.lineToStraightSegment = function(sections, section_index, segment_index){
    sections[section_index].segments[segment_index - 1].x1 = null;
    sections[section_index].segments[segment_index - 1].y1 = null;
    sections[section_index].segments[segment_index].x2 = null;
    sections[section_index].segments[segment_index].y2 = null;
    sections[section_index].unsaved_segments = true;
    //Update Mileage
    exports.updateMileage(sections);
}

exports.lineToBezierSegment = function(sections, section_index, segment_index){
    var segment1 = sections[section_index].segments[segment_index - 1];
    var segment2 = sections[section_index].segments[segment_index];
    var dx = segment2.x - segment1.x;
    var dy = segment2.y - segment1.y;
    if (!numbersValid([dx, dy])) return false;
    sections[section_index].segments[segment_index - 1].x1 = dx / 3;
    sections[section_index].segments[segment_index - 1].y1 = dy / 3;
    sections[section_index].segments[segment_index].x2 = -dx / 3;
    sections[section_index].segments[segment_index].y2 = -dy / 3;
    sections[section_index].unsaved_segments = true;
    //Adjust Control Points
    exports.adjustWithAdjacentSegment(sections, section_index, segment_index - 1, null, false);
    exports.adjustWithAdjacentSegment(sections, section_index, segment_index, null, true);
    //Update Mileage
    exports.updateMileage(sections);
}

exports.lineInsertSegment = function(sections, section_index, segment_index, p){ //p = proportion
    var segment1 = sections[section_index].segments[segment_index - 1];
    var segment2 = sections[section_index].segments[segment_index];
    var x0 = segment1.x;        var y0 = segment1.y;
    var x1_ = segment1.x1;      var y1_ = segment1.y1;
    var x2_ = segment2.x2;      var y2_ = segment2.y2;
    var x3 = segment2.x;        var y3 = segment2.y;
    var isBezier = numbersValid([x1_, y1_, x2_, y2_]);
    //Straight Line
    if (!isBezier){
        var xn = x0 * 1 + (x3 - x0) * p;    var yn = y0 * 1 + (y3 - y0) * p;
        sections[section_index].segments[segment_index - 1].x1 = null;
        sections[section_index].segments[segment_index - 1].y1 = null;
        sections[section_index].segments.splice(segment_index, 0, {
            x: xn, y: yn, x1: null, y1: null, x2: null, y2: null,
        });
        sections[section_index].segments[segment_index + 1].x2 = null;
        sections[section_index].segments[segment_index + 1].y2 = null;
    }
    //Bezier Curve
    else{
        var x1 = (x0 * 1) + (x1_ * 1);      var y1 = (y0 * 1) + (y1_ * 1);
        var x2 = (x3 * 1) + (x2_ * 1);      var y2 = (y3 * 1) + (y2_ * 1);
        //Calculate new control points
        var ax = binomial4(x0, x1, x2, x3, 1-p, false);
        var ay = binomial4(y0, y1, y2, y3, 1-p, false);
        var bx = binomial4(x0, x1, x2, x3, 1-p, true);
        var by = binomial4(y0, y1, y2, y3, 1-p, true);
        //Modify control points
        sections[section_index].segments[segment_index - 1].x1 = ax[2] - ax[1];
        sections[section_index].segments[segment_index - 1].y1 = ay[2] - ay[1];
        sections[section_index].segments.splice(segment_index, 0, {
            x: ax[4],                           y: ay[4],
            x2: ax[3] - ax[4],                  y2: ay[3] - ay[4],
            x1: bx[2] - bx[1],                  y1: by[2] - by[1],
        });
        sections[section_index].segments[segment_index + 1].x2 = bx[3] - bx[4];
        sections[section_index].segments[segment_index + 1].y2 = by[3] - by[4];
    }
    //Update Mileage
    exports.updateMileage(sections);
}

exports.lineRemoveSegment = function(sections, section_index, segment_index){
    if (!sections?.[section_index]?.segments?.[segment_index - 1]) return false;
    if (!sections?.[section_index]?.segments?.[segment_index]) return false;
    if (!sections?.[section_index]?.segments?.[segment_index + 1]) return false;
    //Check if both segments are Bezier
    var x1 = sections[section_index].segments[segment_index - 1].x1;
    var y1 = sections[section_index].segments[segment_index - 1].y1;
    var x2 = sections[section_index].segments[segment_index + 1].x2;
    var y2 = sections[section_index].segments[segment_index + 1].y2;
    var isBezier = numbersValid([x1, y1, x2, y2]);
    //If not Bezier, clear x1, y1, x2, y2
    if (!isBezier){
        sections[section_index].segments[segment_index - 1].x1 = null;
        sections[section_index].segments[segment_index - 1].y1 = null;
        sections[section_index].segments[segment_index + 1].x2 = null;
        sections[section_index].segments[segment_index + 1].y2 = null;
    }
    //If Bezier, prolong x1, y1, x2, y2 according to ratio of lengths
    else{
        var xa = sections[section_index].segments[segment_index - 1].x;
        var ya = sections[section_index].segments[segment_index - 1].y;
        var xb = sections[section_index].segments[segment_index].x;
        var yb = sections[section_index].segments[segment_index].y;
        var xc = sections[section_index].segments[segment_index + 1].x;
        var yc = sections[section_index].segments[segment_index + 1].y;
        var dist_ab = pyth(xb - xa, yb - ya);
        var dist_bc = pyth(xc - xb, yc - yb);
        var dist_ac = pyth(xc - xa, yc - ya);
        if (numbersValid([dist_ab, dist_bc, dist_ac])){
            sections[section_index].segments[segment_index - 1].x1 *= (dist_ac / dist_ab);
            sections[section_index].segments[segment_index - 1].y1 *= (dist_ac / dist_ab);
            sections[section_index].segments[segment_index + 1].x2 *= (dist_ac / dist_ab);
            sections[section_index].segments[segment_index + 1].y2 *= (dist_ac / dist_ab);
        }
    }
    //Remove Segment Point
    sections[section_index].segments.splice(segment_index, 1);
    //Update Mileage
    exports.updateMileage(sections);
}