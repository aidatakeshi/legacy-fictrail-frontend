exports.data = {
    /**
     * Operator
     */
    "operator_type": {
        list: [
            {label: '名稱', field: 'name_chi', field_sub: 'name_eng', format: 'name'},
            {label: '備註', field: 'remarks', format: 'remarks'},
            {label: 'ID', field: 'id', format: 'id'},
            {label: 'Sort', field: 'sort', format: 'sort'},
        ],
    },
    "operator": {
        list: [
            {label: '', field: 'color', format: 'color'},
            {label: '名稱', field: 'name_chi', field_sub: 'name_eng', field_sub_bracket: 'name_eng_short', format: 'name'},
            {label: '標誌', field: 'logo_fileid', format: 'image', width: '3rem', height: '2rem'},
            {label: '備註', field: 'remarks', format: 'remarks'},
            {label: 'ID', field: 'id', format: 'id'},
        ],
    },

    /**
     * Prefecture
     */
    "prefecture_area": {
        list: [
            {label: '名稱', field: 'name_chi', field_sub: 'name_eng', format: 'name'},
            {label: '備註', field: 'remarks', format: 'remarks'},
            {label: 'ID', field: 'id', format: 'id'},
            {label: 'Sort', field: 'sort', format: 'sort'},
        ],
    },
    "prefecture": {
        list: [
            {label: '名稱', field: 'name_chi_full', field_bracket: 'name_chi_short', field_sub: 'name_eng_full', field_sub_bracket: 'name_eng_short', format: 'name'},
            {label: '備註', field: 'remarks', format: 'remarks'},
            {label: 'ID', field: 'id', format: 'id'},
            {label: 'Sort', field: 'sort', format: 'sort'},
        ],
    },

    /**
     * Line
     */
    "line_type": {
        list: [
            {label: '', field: 'color', format: 'color'},
            {label: '名稱', field: 'name_chi', field_sub: 'name_eng', format: 'name'},
            {label: '客運HR', field: 'is_passenger_hr', format: 'boolean'},
            {label: '主要', field: 'major', format: 'boolean'},
            {label: '備註', field: 'remarks', format: 'remarks'},
            {label: 'ID', field: 'id', format: 'id'},
            {label: 'Sort', field: 'sort', format: 'sort'},
        ],
    },
    "line_group": {
        list: [
            {label: '名稱', field: 'name_chi', field_sub: 'name_eng', field_sub_bracket: 'name_eng_short', format: 'name'},
            {label: '備註', field: 'remarks', format: 'remarks'},
            {label: 'ID', field: 'id', format: 'id'},
        ],
    },
    "line": {
        list: [
            {label: '', field: 'operator_color', format: 'color'},
            {label: '營運者', field: 'operator_name_chi', field_sub: 'operator_name_eng', format: 'name'},
            {label: '', field: 'color', format: 'color'},
            {label: '名稱', field: 'name_chi', field_sub: 'name_eng', field_sub_bracket: 'name_eng_short', format: 'name'},
            {label: '車站', field: 'station_count', format: 's_line_station_count'},
            {label: '長度', field: 'length_km', format: 'number', decimals: 1, unit: 'km'},
            {label: '最高速度', field: 'max_speed_kph', format: 'number', unit: 'km/h'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
    },

    /**
     * Station
     */
    "station": {
        list: [
            {label: '', field: 'operator_color', format: 'color'},
            {label: '營運者', field: 'operator_name_chi', field_sub: 'operator_name_eng', format: 'name'},
            {label: '地區', field: 'prefecture_name_chi'},
            {label: '名稱', field: 'name_chi', field_sub: 'name_eng', format: 'name'},
            {label: '軌道數', field: 'track_count'},
            {label: '主要', field: 'major', format: 'boolean'},
            {label: '信號', field: 'is_signal_only', format: 'boolean'},
            {label: '廢止', field: 'is_abandoned', format: 'boolean'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
    },

    /**
     * Train Type / Name
     */
    "train_type": {
        list: [
            {label: '', field: 'operator_color', format: 'color'},
            {label: '營運者', field: 'operator_name_chi', field_sub: 'operator_name_eng', format: 'name'},
            {label: '', field: 'color', format: 'color'},
            {label: '名稱', field: 'name_chi', field_sub: 'name_eng', field_bracket: 'name_chi_short', field_sub_bracket: 'name_eng_short', format: 'name'},
            {label: '有料', field: 'is_premium', format: 'boolean'},
            {label: '備註', field: 'remarks', format: 'remarks'},
            {label: 'ID', field: 'id', format: 'id'},
            {label: 'Sort', field: 'sort', format: 'sort'},
        ],
    },
    "train_name": {
        list: [
            {label: '主要', field: 'major_operator_color', format: 'color'},
            {label: '營運者', field: 'major_operator_name_chi', field_sub: 'major_operator_name_eng', format: 'name'},
            {label: '', field: 'color', format: 'color'},
            {label: '名稱', field: 'name_chi', field_sub: 'name_eng', format: 'name'},
            {label: '最高速度', field: 'max_speed_kph', format: 'number', unit: 'km/h'},
            {label: '備註', field: 'remarks', format: 'remarks'},
        ],
    },

    /**
     * Vehicle Performance
     */
    "vehicle_performance_group": {
        list: [

        ],
    },
    "vehicle_performance_item": {
        list: [

        ],
    },

};