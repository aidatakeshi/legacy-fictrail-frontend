const config = require('~/map-new-config.js');

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

/**
 * Get Pixels per km (approximate value, exact for horizontal line or middle vertical line only)
 */
exports.pixelsPerKm = config.map_height / config.lat_span / (config.earth_radius * Math.PI / 180);

/**
 * Get Latitude/Longitude from X, Y in Map (w 7000 h 5000)
 * Input: ({x, y}) or (x, y)
 */
exports.getLatLonFromXY = function(x, y){
    //Handle object
    if (y === undefined){
        var obj = x || {};
        if (obj.x == null || obj.y == null) return {lat: null, lon: null};
        return exports.getLatLonFromXY(obj.x, obj.y);
    }
    //Calculate latitude
    var per_deg_lat = config.map_height / config.lat_span;
    var latitude = config.lat_mid - (y - config.map_height / 2) / per_deg_lat;
    //Calculate longitude
    var per_deg_lon = per_deg_lat * Math.cos(latitude * Math.PI / 180);
    var longitude = config.lon_mid + (x - config.map_width / 2) / per_deg_lon;
    //Return
    return {lat: latitude, lon: longitude};
};

/**
 * (Reverse) Get X, Y in Map (w 7000 h 5000) from Latitude/Longitude
 * Input: ({lat, lon}) or (lat, lon)
 */
exports.getXYFromLatLon = function(latitude, longitude){
    //Handle object
    if (longitude === undefined){
        var obj = latitude || {};
        if (obj.lat == null || obj.lon == null) return {x: null, y: null};
        return exports.getXYFromLatLon(obj.lat, obj.lon);
    }
    //Calculate y
    var per_deg_lat = config.map_height / config.lat_span;
    var y = config.map_height / 2 + per_deg_lat * (config.lat_mid - latitude);
    //Calculate x
    var per_deg_lon = per_deg_lat * Math.cos(latitude * Math.PI / 180);
    var x = config.map_width / 2 + per_deg_lon * (longitude - config.lon_mid);
    //Return
    return {x: x, y: y};
};

/**
 * Get Distance (km) between two Sets of Lat/Lon
 */
exports.getDistanceBetween = function(lat1, lon1, lat2, lon2){
    //Handle object
    if (lat2 === undefined || lon2 === undefined){
        var obj1 = lat1 || {};
        var obj2 = lon1 || {};
        if (obj1.lat == null || obj1.lon == null) return {x: null, y: null};
        if (obj2.lat == null || obj2.lon == null) return {x: null, y: null};
        return exports.getDistanceBetween(obj1.lat, obj1.lon, obj2.lat, obj2.lon);
    }
    //Calculate
    var lat1_rad = lat1 * Math.PI / 180;
    var lat2_rad = lat2 * Math.PI / 180;
    var lat_diff_rad = (lat2 - lat1) * Math.PI / 180;
    var lon_diff_rad = (lon2 - lon1) * Math.PI / 180;
    var p = Math.sin(lat_diff_rad/2);
    var q = Math.sin(lon_diff_rad/2);
    var a = p * p + q * q * Math.cos(lat1_rad) * Math.cos(lat2_rad);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return config.earth_radius * c;
};

/**
 * Get Length of section (in km)
 */
exports.getLengthOfSection = function(section){
    if (!Array.isArray(section.segments)) return 0;
    if (section.segments.length < 2) return 0;
    var dist = 0;
    //For each segment
    for (var i = 1; i < section.segments.length; i++){
        var length_px = exports.getLengthOfSegmentInPixels(section.segments[i-1], section.segments[i]);
        var x1 = section.segments[i-1].x; var y1 = section.segments[i-1].y;
        var x2 = section.segments[i].x; var y2 = section.segments[i].y;
        var dx = (x2 - x1); var dy = (y2 - y1);
        var length_direct = Math.sqrt(dx * dx + dy * dy);
        var lat_lon_1 = exports.getLatLonFromXY(x1, y1);
        var lat_lon_2 = exports.getLatLonFromXY(x2, y2);
        var dist_km = exports.getDistanceBetween(lat_lon_1, lat_lon_2);
        dist += dist_km / length_direct * length_px;
    }
    return dist;
};

/**
 * Get Length of a segment (in px)
 */
exports.getLengthOfSegmentInPixels = function(point1, point2){
    var x = point1.x; var y = point1.y;
    var x1 = point1.x + point1.x1; var y1 = point1.y + point1.y1;
    var x2 = point2.x + point2.x2; var y2 = point2.y + point2.y2;
    var xx = point2.x; var yy = point2.y;
    var cp1_exists = !isNaN(x1) && !isNaN(y1);
    var cp2_exists = !isNaN(x2) && !isNaN(y2);
    
    //Straight Line
    if (!cp1_exists && !cp2_exists){
        var dx = xx - x; var dy = yy - y;
        //Return direct distance
        return Math.sqrt(dx * dx + dy * dy);
    }

    //Spline Curve
    if (!cp1_exists){ x1 = x2; y1 = y2; }
    else if (!cp2_exists){ x2 = x1; y2 = y1; }
    return getLengthOfBezier(x, y, x1, y1, x2, y2, xx, yy, 0, 1, x, y, xx, yy);

}

const bezier_error_tolerance = 0.0001;

var getLengthOfBezier = function(x, y, x1, y1, x2, y2, xx, yy, a, b, xa, ya, xb, yb){ //b > a
    //Get points A, B, C, D
    var c = (a * 2 + b) / 3;
    var d = (a + b * 2) / 3;
    var xc = getCubicInterpolation(x, x1, x2, xx, c);
    var yc = getCubicInterpolation(y, y1, y2, yy, c);
    var xd = getCubicInterpolation(x, x1, x2, xx, d);
    var yd = getCubicInterpolation(y, y1, y2, yy, d);

    //Check distance of AC, CD, DB and AB respectively.
    var dx = (xa - xc); var dy = (ya - yc);
    var dist_ac = Math.sqrt(dx * dx + dy * dy);
    var dx = (xc - xd); var dy = (yc - yd);
    var dist_cd = Math.sqrt(dx * dx + dy * dy);
    var dx = (xd - xb); var dy = (yd - yb);
    var dist_db = Math.sqrt(dx * dx + dy * dy);
    var dx = (xa - xb); var dy = (ya - yb);
    var dist_ab = Math.sqrt(dx * dx + dy * dy);

    //If distance is 0, directly return 0;
    if (!dist_db) return 0;

    //Check distance error
    var dist_error = Math.abs(dist_ac + dist_cd + dist_db - dist_ab);

    //If error smaller than tolerance, return the value
    if (dist_error <= bezier_error_tolerance){
        return (dist_ac + dist_cd + dist_db);
    }

    //Otherwise, split it off and calculate again
    var $a = getLengthOfBezier(x, y, x1, y1, x2, y2, xx, yy, a, c, xa, ya, xc, yc);
    var $b = getLengthOfBezier(x, y, x1, y1, x2, y2, xx, yy, c, d, xc, yc, xd, yd);
    var $c = getLengthOfBezier(x, y, x1, y1, x2, y2, xx, yy, d, b, xd, yd, xb, yb);
    return $a + $b + $c;
}

var getCubicInterpolation = function (a, b, c, d, n){
    var m = 1 - n;
    return d*n*n*n + c*m*n*n*3 + b*m*m*n*3 + a*m*m*m;
}

/**
 * Get Minimum Radius of Bezier Curve (in px)
 */
const GET_MIN_RADIUS_BEZIER_SPAN = 0.001;
const GET_MIN_RADIUS_PRECISION = 0.001;
const GET_MIN_RADIUS_STACK_LIMIT = 50;

exports.getMinRadiusOfBezier = function(x, y, x1_, y1_, x2_, y2_, xx, yy){
    if (!numbersValid([x1_, y1_, x2_, y2_])) return null;
    var x1 = x * 1 + x1_ * 1;
    var y1 = y * 1 + y1_ * 1;
    var x2 = xx * 1 + x2_ * 1;
    var y2 = yy * 1 + y2_ * 1;

    var min_radius = Math.min(
        getMinRadiusOfBezier_sub(x, y, x1, y1, x2, y2, xx, yy, GET_MIN_RADIUS_BEZIER_SPAN, 0.5),
        getMinRadiusOfBezier_sub(x, y, x1, y1, x2, y2, xx, yy, 0.5, 1-GET_MIN_RADIUS_BEZIER_SPAN)
    );
    if (!isFinite(min_radius)) return null;
    return min_radius;
}

function getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, n, attrX, attrY){
    var m = 1 - n;
    var result = {};
    result[attrX] = m*m*m*x0 + 3*m*m*n*x1 + 3*m*n*n*x2 + n*n*n*x3;
    result[attrY] = m*m*m*y0 + 3*m*m*n*y1 + 3*m*n*n*y2 + n*n*n*y3;
    return result;
}

function getRadiusOfThreePoints(xa, ya, xb, yb, xc, yc){
    var p = pyth(yb - ya, xb - xa);
    var q = pyth(yc - yb, xc - xb);
    var theta = Math.PI - Math.abs(Math.atan2(yb - ya, xb - xa) - Math.atan2(yc - yb, xc - xb));
    var tana = (q / p - Math.cos(theta)) / Math.sin(theta);
    var a = Math.atan(tana);
    var cosa = Math.cos(a);
    if (!cosa) return Infinity;
    return p / cosa / 2;
}

function getMinRadiusOfBezier_sub(x0, y0, x1, y1, x2, y2, x3, y3, a, b, radius_a = null, radius_b = null, stack = 0){

    //If over stack limit, terminate
    if (stack >= GET_MIN_RADIUS_STACK_LIMIT){
        return (radius_a + radius_b) / 2;
    }

    //If radius_a, radius_b provided, check if their differences are under threshold
    if (radius_a && radius_b){
        if (Math.abs(radius_b - radius_a) < GET_MIN_RADIUS_PRECISION){
            return (radius_a + radius_b) / 2;
        }
    }

    //If radius_a, radius_b not provided, calculate them
    else{
        var {xa, ya} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, a, 'xa', 'ya');
        var {xal, yal} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, a - GET_MIN_RADIUS_BEZIER_SPAN, 'xal', 'yal');
        var {xar, yar} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, a + GET_MIN_RADIUS_BEZIER_SPAN, 'xar', 'yar');
        var {xb, yb} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, b, 'xb', 'yb');
        var {xbl, ybl} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, b - GET_MIN_RADIUS_BEZIER_SPAN, 'xbl', 'ybl');
        var {xbr, ybr} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, b + GET_MIN_RADIUS_BEZIER_SPAN, 'xbr', 'ybr');
        var radius_a = getRadiusOfThreePoints(xal, yal, xa, ya, xar, yar);
        var radius_b = getRadiusOfThreePoints(xbl, ybl, xb, yb, xbr, ybr);
    }

    //Calculate radius at p, q
    var p = a + (b - a) / 3;
    var q = b - (b - a) / 3;
    var {xp, yp} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, p, 'xp', 'yp');
    var {xpl, ypl} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, p - GET_MIN_RADIUS_BEZIER_SPAN, 'xpl', 'ypl');
    var {xpr, ypr} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, p + GET_MIN_RADIUS_BEZIER_SPAN, 'xpr', 'ypr');
    var {xq, yq} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, q, 'xq', 'yq');
    var {xql, yql} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, q - GET_MIN_RADIUS_BEZIER_SPAN, 'xql', 'yql');
    var {xqr, yqr} = getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, q + GET_MIN_RADIUS_BEZIER_SPAN, 'xqr', 'yqr');
    var radius_p = getRadiusOfThreePoints(xpl, ypl, xp, yp, xpr, ypr);
    var radius_q = getRadiusOfThreePoints(xql, yql, xq, yq, xqr, yqr);

    //If radius_a is smallest -> reduce to (a, p)
    if (radius_a < radius_b && radius_a < radius_p && radius_a < radius_q){
        return getMinRadiusOfBezier_sub(x0, y0, x1, y1, x2, y2, x3, y3, a, p, radius_a, radius_p, stack+1);
    }

    //If radius_b is smallest -> reduce to (q, b)
    else if (radius_b < radius_a && radius_b < radius_p && radius_b < radius_q){
        return getMinRadiusOfBezier_sub(x0, y0, x1, y1, x2, y2, x3, y3, b, q, radius_b, radius_q, stack+1);
    }

    //If radius_p is smallest -> reduce to (a, q)
    if (radius_p < radius_a && radius_p < radius_b && radius_p < radius_q){
        return getMinRadiusOfBezier_sub(x0, y0, x1, y1, x2, y2, x3, y3, a, q, radius_a, radius_q, stack+1);
    }

    //If radius q is smallest -> reduce to (p, b)
    else{
        return getMinRadiusOfBezier_sub(x0, y0, x1, y1, x2, y2, x3, y3, p, b, radius_p, radius_b, stack+1);
    }

}

/**
 * Get Minimum Radius of Section (in m)
 */
exports.getMinRadiusOfSection = function(section){
    if (!Array.isArray(section.segments)) return 0;
    if (section.segments.length < 2) return 0;
    var result = null;
    //For each segment
    for (var i = 1; i < section.segments.length; i++){
        var segment1 = section.segments[i - 1];
        var segment2 = section.segments[i];
        var min_radius = exports.getMinRadiusOfBezier(
            segment1.x, segment1.y, segment1.x1, segment1.y1, segment2.x2, segment2.y2, segment2.x, segment2.y
        );
        if (min_radius){
            var min_radius_m = min_radius / exports.pixelsPerKm * 1000;
            if (result === null || result > min_radius_m){
                result = min_radius_m;
            }
        }
    }
    return result;
};