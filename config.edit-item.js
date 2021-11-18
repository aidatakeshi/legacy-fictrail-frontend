exports.data = {
    /**
     * Operator
     */
    "operator_type": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '名稱 (中文)', field: 'name_chi'},
            {label: '名稱 (Eng)', field: 'name_eng'},
            {label: 'Sort', field: 'sort', format: 'number'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
    },
    "operator": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '營運者類別', field: 'operator_type_id', format: 'select', select_type: 'operator_type'},
            {label: '名稱 (中文)', field: 'name_chi'},
            {label: '名稱 (Eng)', field: 'name_eng'},
            {label: '簡稱 (中文)', field: 'name_chi_short'},
            {label: '簡稱 (Eng)', field: 'name_eng_short'},
            {label: '代表色彩', field: 'color', format: 'color'},
            {label: '文字色彩', field: 'color_text', format: 'color'},
            {label: '載客HR?', field: 'is_passenger_hr', format: 'boolean'},
            {label: '標誌', field: 'logo_fileid', format: 'image', width: '40%'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
        default: {
            'is_passenger_hr': false,
        },
    },

    /**
     * Prefecture
     */
    "prefecture_area": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '名稱 (中文)', field: 'name_chi'},
            {label: '名稱 (Eng)', field: 'name_eng'},
            {label: 'Sort', field: 'sort', format: 'number'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
    },
    "prefecture": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '廣域地區', field: 'area_id', format: 'select', select_type: 'prefecture_area'},
            {label: '名稱 (中文)', field: 'name_chi'},
            {label: '名稱 (Eng)', field: 'name_eng'},
            {label: '字尾 (中文)', field: 'name_chi_suffix'},
            {label: '字尾 (Eng)', field: 'name_eng_suffix'},
            {label: '簡稱 (中文)', field: 'name_chi_short'},
            {label: '簡稱 (Eng)', field: 'name_eng_short'},
            {label: 'Sort', field: 'sort', format: 'number'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
    },

    /**
     * Line
     */
    "line_type": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '名稱 (中文)', field: 'name_chi'},
            {label: '名稱 (Eng)', field: 'name_eng'},
            {label: '主要?', field: 'major', format: 'boolean'},
            {label: '載客HR?', field: 'is_passenger_hr', format: 'boolean'},
            {label: '色彩', field: 'color', format: 'color'},
            {label: 'Sort', field: 'sort', format: 'number'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
        default: {
            'major': false,
        },
    },
    "line_group": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '名稱 (中文)', field: 'name_chi'},
            {label: '名稱 (Eng)', field: 'name_eng'},
            {label: '簡稱 (Eng)', field: 'name_eng_short'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
    },
    "line": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '路線組合', field: 'line_group_id', format: 'select', select_type: 'line_group', nullable: true},
            {label: '路線類別', field: 'line_type_id', format: 'select', select_type: 'line_type'},
            {label: '營運者', field: 'operator_id', format: 'select', select_type: 'operator'},
            {label: '名稱 (中文)', field: 'name_chi'},
            {label: '名稱 (Eng)', field: 'name_eng'},
            {label: '簡稱 (Eng)', field: 'name_eng_short'},
            {label: '代表色彩', field: 'color', format: 'color'},
            {label: '文字色彩', field: 'color_text', format: 'color'},
            {label: '最高速度 (km/h)', field: 'max_speed_kph', format: 'number'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
    },

    /**
     * Station
     */
    "station": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '營運者', field: 'operator_id', format: 'select', select_type: 'operator'},
            {label: '地區', field: 'prefecture_id', format: 'select', select_type: 'prefecture'},
            {label: '名稱 (中文)', field: 'name_chi'},
            {label: '名稱 (Eng)', field: 'name_eng'},
            {label: '主要車站', field: 'major', format: 'boolean'},
            {label: '海拔 (m)', field: 'height_m', format: 'number'},
            {label: '信號所', field: 'is_signal_only', format: 'boolean'},
            {label: '已廢止', field: 'is_abandoned', format: 'boolean'},
            {label: '月台/軌道編號', field: 'tracks', format: 's_station_track_number'},
            {label: '軌道相交點 (時刻表用)', field: 'track_cross_points', format: 's_station_track_cross_points'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
        default: {
            'major': false,
            'is_signal_only': false,
            'is_abandoned': false,
            'tracks': ['1', '2'],
            'track_cross_points': [],
        },
    },

    /**
     * Train Type / Name
     */
    "train_type": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '營運者', field: 'operator_id', format: 'select', select_type: 'operator', nullable: true},
            {label: '名稱 (中文)', field: 'name_chi'},
            {label: '名稱 (Eng)', field: 'name_eng'},
            {label: '簡稱 (中文)', field: 'name_chi_short'},
            {label: '簡稱 (Eng)', field: 'name_eng_short'},
            {label: '代表色彩', field: 'color', format: 'color'},
            {label: '文字色彩', field: 'color_text', format: 'color'},
            {label: '有料', field: 'is_premium', format: 'boolean'},
            {label: 'Sort', field: 'sort', format: 'number'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
    },
    "train_name": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '列車種別', field: 'train_type_id', format: 'select', select_type: 'train_type'},
            {label: '主要營運者', field: 'major_operator_id', format: 'select', select_type: 'operator', nullable: true},  
            {label: '名稱 (中文)', field: 'name_chi'},
            {label: '名稱 (Eng)', field: 'name_eng'},
            {label: '代表色彩', field: 'color', format: 'color'},
            {label: '文字色彩', field: 'color_text', format: 'color'},
            {label: '最高速度', field: 'max_speed_kph', format: 'number'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
    },

    /**
     * Vehicle Performance
     */
    "vehicle_performance_group": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '標題', field: 'name_chi'},
            {label: 'Sort', field: 'sort', format: 'number'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
    },
    "vehicle_performance_item": {
        //Use Dedicated Editor
    },

    /**
     * Schedule Draft
     */
    "schdraft_category": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '標題', field: 'title'},
            {label: '啟用', field: 'is_enabled', format: 'boolean'},
            {label: 'Sort', field: 'sort', format: 'number'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
        default: {
            'is_enabled': true,
        },
    },
    "schdraft_group": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '時刻表分類', field: 'category_id', format: 'select', select_type: 'schdraft_category'},
            {label: '標題', field: 'title'},
            {label: '啟用', field: 'is_enabled', format: 'boolean'},
            {label: 'Sort', field: 'sort', format: 'number'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
        default: {
            'is_enabled': true,
        },
    },
    "schdraft_template": {
        editor: [
            {label: 'ID', field: 'id', format: 'id'},
            {label: '時刻表群組', field: 'group_id', format: 'select', select_type: 'schdraft_group'},
            {label: '標題', field: 'title'},
            {label: '啟用', field: 'is_enabled', format: 'boolean'},
            {label: '上行?', field: 'is_upbound', format: 'boolean'},
            {label: '基準時間', field: 'pivot_time', format: 'time'},
            {label: '基準時間調整', field: 'pivot_time_adj', format: 'time_shift'},
            {label: '列車種別', field: 'train_type_id', format: 'select', select_type: 'train_type'},
            {label: '列車名稱', field: 'train_name_id', format: 'select', select_type: 'train_name', nullable: true},
            {label: '營運者', field: 'operator_id', format: 'select', select_type: 'operator'},
            {label: '車輛性能', field: 'vehicle_performance_id', format: 'select', select_type: 'vehicle_performance_item'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
        default: {
            'is_enabled': true,
            'is_upbound': false,
            'pivot_time': 43200,
            'pivot_time_adj': 0,
        },
    },

};