//Mileage
exports.mileage_decimals = 1;

//Map Size
exports.map_width = 7000;
exports.map_height = 5000;

//Scrolling & Key Press
exports.scroll_zoom_step = 10 ** (1/5);
exports.keypress_translation_step = 0.001;
exports.keycodeLeft = 37;
exports.keycodeRight = 39;
exports.keycodeUp = 38;
exports.keycodeDown = 40;

//Zoom Limit
exports.zoom_max = 50;
exports.zoom_button_step = 10 ** (1/5);

//Scale
exports.scale_levels = [
    {dist: 100, text: '100km', text_half: '50km'},
    {dist: 50, text: '50km', text_half: '25km'},
    {dist: 20, text: '20km', text_half: '10km'},
    {dist: 10, text: '10km', text_half: '5km'},
    {dist: 5, text: '5km', text_half: '2.5km'},
    {dist: 2, text: '2km', text_half: '1km'},
    {dist: 1, text: '1km', text_half: '500m'},
    {dist: 0.5, text: '500m', text_half: '250m'},
    {dist: 0.2, text: '200m', text_half: '100m'},
    {dist: 0.1, text: '100m', text_half: '50m'},
    {dist: 0.05, text: '50m', text_half: '25m'},
    {dist: 0.02, text: '20m', text_half: '10m'},
    {dist: 0.01, text: '10m', text_half: '5m'},
    {dist: 0.005, text: '5m', text_half: '2.5m'},
    {dist: 0.002, text: '2m', text_half: '1m'},
    {dist: 0.001, text: '1m', text_half: '0.5m'},
];
exports.scale_width_max = 150;
exports.scale_border = 2;
exports.scale_right = 5;
exports.scale_top = 10;
exports.scale_height = 6;
exports.scale_text_width = 100;
exports.scale_font_size = 12;
exports.scale_text_x_shift = -2.5;
exports.scale_text_y_shift = -3.5;

//Compass
exports.compass_major_border = 2;
exports.compass_major_alpha = 0.5;
exports.compass_minor_border = 1;
exports.compass_minor_alpha = 0.3;
exports.compass_font_size = 12;
exports.compass_text_width = 200;
exports.compass_text_x_shift = +3;
exports.compass_text_y_shift1 = -12;
exports.compass_text_y_shift2 = +2;

//Distance Calculation
exports.lat_mid = 36.5; //36.5N
exports.lat_span = 9; //32 ~ 41N
exports.lon_mid = 158; //158E
exports.earth_radius = 6371.0088;

//Coordinates Indicator
exports.coordinates_indicator_size = 50;
exports.coordinates_indicator_color = '#900';
exports.coordinates_indicator_border = 1;

//Station
exports.station_major_radius = (zoom) => Math.max(4, zoom * 0.7);
exports.station_major_border = (zoom) => Math.max(2, zoom * 0.2);
exports.station_major_display_zoom_min = 1;

exports.station_minor_radius = (zoom) => Math.max(3, zoom * 0.5);
exports.station_minor_border = (zoom) => Math.max(1, zoom * 0.1);
exports.station_minor_display_zoom_min = 2;

exports.station_signal_side = (zoom) => Math.max(3, zoom * 0.5) * 2;


exports.station_abandoned_cross_size = (zoom) => Math.max(12, zoom * 3);
exports.station_abandoned_cross_border = (zoom) => Math.max(2, zoom * 0.2);

exports.station_hit_radius = (zoom) => Math.max(6, zoom * 0.6);
exports.station_selected_highlighter = 'yellow';
exports.station_selected_highlighter_border_ratio = 2;
exports.station_selected_highlighter_alpha = 0.5;

exports.station_name_label_major_display_zoom_min = 1;
exports.station_name_label_minor_display_zoom_min = 2;
exports.station_name_label_major_font_size = 12;
exports.station_name_label_minor_font_size = 10;
exports.station_name_label_major_width = 50;
exports.station_name_label_minor_width = 42;
exports.station_name_label_y_shift = 3;

//Line
exports.line_major_border = (zoom) => Math.max(6, zoom * 0.6)
exports.line_major_decoration_border = (zoom) => Math.max(3, zoom * 0.3);
exports.line_major_decoration_color = 'rgba(255, 255, 255, 0.8)';
exports.line_major_decoration_dash1 = (zoom) => Math.max(8, zoom * 0.8);
exports.line_major_decoration_dash2 = (zoom) => Math.max(8, zoom * 0.8);

exports.line_minor_border = (zoom) => Math.max(4, zoom * 0.4)
exports.line_minor_decoration_border = (zoom) => Math.max(2, zoom * 0.2);
exports.line_minor_decoration_color = 'rgba(255, 255, 255, 0.8)';
exports.line_minor_decoration_dash1 = (zoom) => Math.max(6, zoom * 0.6);
exports.line_minor_decoration_dash2 = (zoom) => Math.max(6, zoom * 0.6);

exports.line_hit_border = (zoom) => Math.max(12, zoom * 0.6);
exports.line_selected_highlighter = 'yellow';
exports.line_selected_highlighter_border_ratio = 2;

//Line Control Points
exports.line_cp_zoom_min = 2;

//...Section Indicator (Circle Dot)
exports.line_cp_section_radius = (zoom) => Math.max(3, zoom * 0.3);
exports.line_cp_section_border = (zoom) => Math.max(2, zoom * 0.2);
exports.line_cp_section_hit_radius = (zoom) => Math.max(7.5, zoom * 0.75);

//...Segment Indicator (Cross)
exports.line_cp_segment_size = (zoom) => Math.max(6, zoom * 0.6);
exports.line_cp_segment_border = (zoom) => Math.max(2, zoom * 0.2);
exports.line_cp_segment_hit_radius = (zoom) => Math.max(4.5, zoom * 0.45);

//...Bezier Control Point (Cross & Connecting Line)
exports.line_cp_bezier_size = (zoom) => Math.max(6, zoom * 0.6);
exports.line_cp_bezier_border = (zoom) => Math.max(1, zoom * 0.1);
exports.line_cp_bezier_hit_radius = (zoom) => Math.max(4.5, zoom * 0.45);
exports.line_cp_bezier_alpha = 0.3;

//Line Right-click Menu
exports.line_edit_menu_button_font_size = 14;
exports.line_edit_menu_button_font_color = 'white';
exports.line_edit_menu_button_font_color2 = 'black';
exports.line_edit_menu_button_text_yshift = 3.5;
exports.line_edit_menu_button_width = 100;
exports.line_edit_menu_button_height = 20;
exports.line_edit_menu_button_gap = 2;
exports.line_edit_menu_button_border = 1;
exports.line_edit_menu_button_default_background = 'white';
exports.line_edit_menu_button_default_border_color = '#999';
exports.line_edit_menu_border = 1;
exports.line_edit_menu_border_color = 'black';
exports.line_edit_menu_background = 'white';
exports.line_edit_menu_x_offset = 10;
exports.line_edit_menu_y_offset = 10;
exports.line_edit_menu_hover_alpha = 0.3;
exports.line_edit_menu_hover_alpha2 = 0.1;

exports.line_edit_menu_box_function = function(item_count){
    var x_offset = exports.line_edit_menu_x_offset;
    var y_offset = exports.line_edit_menu_y_offset;
    var rect_width = exports.line_edit_menu_button_gap * 2 + exports.line_edit_menu_button_width;
    var rect_height = exports.line_edit_menu_button_gap * (item_count + 1)
    + exports.line_edit_menu_button_height * item_count;
    return [
        0, 0,
        x_offset + 5, y_offset, 
        x_offset + rect_width, y_offset,
        x_offset + rect_width, y_offset + rect_height,
        x_offset, y_offset + rect_height,
        x_offset, y_offset + 5,
    ];
}