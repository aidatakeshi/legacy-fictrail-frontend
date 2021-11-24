//Mileage & Time
exports.mileage_decimals = 1;
exports.hour_start = 3;

//Left / Right / Top / Bottom Margin
exports.margin_left = 60;
exports.margin_top = 60;
exports.margin_bottom = 30;
exports.margin_right = 5;
exports.frame_bg_color = 'white';

//Scale Max / Min
exports.xscale_default = 0.12;
exports.xscale_max = 2; //120px per minute
exports.xscale_min = 1/60; //60px per hour
exports.yscale_max = 500; //500px per km
exports.yscale_min = 0.5; //0.5px per km
exports.scale_step = 10 ** (1/3);
exports.scroll_step = 10; //px

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
exports.label_station_y_shift = 0;
exports.label_station_y_hide_tolerance = 5;
exports.label_station_width = 54;

//Time Displays (Vertical Line & Horizontal Labels)
exports.label_time_font_size = 12;
exports.label_time_font_style = 'bold';
exports.label_time_y_shift = -15;
exports.label_time_big_font_size = 15;
exports.label_time_big_font_style = 'bold';
exports.label_time_big_y_shift = -18;
exports.label_time_x_hide_tolerance = 5;
exports.time_display_modes = [
    //Major Line: 1h; Minor Line: 5m
    {
        min_scale: 0, major_unit: 3600, minor_unit: 300, label: "H"
    },
    //Major Line: 10m; Minor Line: 1m
    {
        min_scale: 0.1, major_unit: 600, minor_unit: 60, label: "H|MM"
    },
    //Major Line: 1m; Minor Line: 5s
    {
        min_scale: 0.6, major_unit: 60, minor_unit: 5, label: "H:MM"
    },
];

//Display of Time Direction Grid Lines
exports.time_5m_show_scale = 0.01;
exports.time_5m_major_scale = 0.1;
exports.time_1m_show_scale = 0.1;
exports.time_1m_major_scale = 0.6;
exports.time_5s_show_scale = 0.6;
exports.time_5s_major_scale = 6;