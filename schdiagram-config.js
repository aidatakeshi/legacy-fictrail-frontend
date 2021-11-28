//Mileage & Time
exports.mileage_decimals = 1;
exports.hour_start = 3;
exports.xpos_default = (12 - 3) / 24;

//Left / Right / Top / Bottom Margin
exports.margin_left = 60;
exports.margin_top = 60;
exports.margin_bottom = 30;
exports.margin_right = 5;
exports.frame_bg_color = 'white';

//Scale Max / Min
exports.xscale_default = 0.06;
exports.xscale_max = 2; //120px per minute
exports.xscale_min = 1/60; //60px per hour
exports.yscale_max = 500; //500px per km
exports.yscale_min = 0.5; //0.5px per km
exports.scale_step = 10 ** (1/5);
exports.scroll_step = 10 ** (1/5);

//Grid Line
exports.grid_frame_width = 2;
exports.grid_major_width = 2;
exports.grid_minor_width = 1;
exports.grid_frame_color = '#ccc';
exports.grid_major_color = '#ddd';
exports.grid_minor_color = '#eee';

//Stations (Vertical Labels)
exports.label_station_font_size = 10;
exports.label_station_font_style = 'bold';
exports.label_station_x = 57;
exports.label_station_y_shift = -5;
exports.label_station_y_hide_tolerance = 2;
exports.label_station_width = 54;

exports.label_mileage_font_size = 8;
exports.label_mileage_font_style = 'bold';
exports.label_mileage_x = -7;
exports.label_mileage_y_shift = -8;

//Time Displays (Vertical Line & Horizontal Labels)
exports.label_time_font_size = 10;
exports.label_time_font_style = 'bold';
exports.label_time_y_shift = -15;
exports.label_time_big_font_size = 15;
exports.label_time_big_font_style = 'bold';
exports.label_time_big_y_shift = -20;
exports.label_time_x_hide_tolerance = 2;
exports.time_display_modes = [
    //Major Line: 1m; Minor Line: 5s; Label: 1m
    {
        min_scale: 0.6, major_unit: 60, minor_unit: 5, label_unit: 60, label: "H:MM"
    },
    //Major Line: 1m; Minor Line: 15s; Label: 2m
    {
        min_scale: 0.3, major_unit: 60, minor_unit: 15, label_unit: 120, label: "H:MM"
    },
    //Major Line: 5m; Minor Line: 1m; Label: 5m
    {
        min_scale: 0.12, major_unit: 300, minor_unit: 60, label_unit: 300, label: "H|MM"
    },
    //Major Line: 5m; Minor Line: 1m; Label: 10m
    {
        min_scale: 0.06, major_unit: 300, minor_unit: 60, label_unit: 600, label: "H|MM"
    },
    //Major Line: 10m; Minor Line: 2m; Label: 10m
    {
        min_scale: 0.04, major_unit: 600, minor_unit: 120, label_unit: 600, label: "H|MM"
    },
    //Major Line: 30m; Minor Line: 5m; Label: 30m
    {
        min_scale: 0.02, major_unit: 1800, minor_unit: 300, label_unit: 1800, label: "H|MM"
    },
    //Major Line: 1h; Minor Line: 5m; Label: 5m
    {
        min_scale: 0, major_unit: 3600, minor_unit: 300, label_unit: 3600, label: "H"
    },
];

//Line
exports.line_normal_width = 2;
exports.line_lowkey_width = 1;
exports.line_lowkey_opacity = 0.2;

//Line Points
exports.line_point_detect_width = 10;
exports.line_point_detect_height = 15;