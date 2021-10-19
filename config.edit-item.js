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
            
        ],
    },

    /**
     * Train Type / Name
     */
    "train_type": {
        editor: [

        ],
    },
    "train_name": {
        editor: [

        ],
    },

    /**
     * Vehicle Performance
     */
    "vehicle_performance_group": {
        editor: [

        ],
    },
    "vehicle_performance_item": {
        editor: [

        ],
    },

};