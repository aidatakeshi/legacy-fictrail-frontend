exports.data = {
    /**
     * Operator
     */
    "operator_type": {
        api_call: "operator_type",
        display: "name_chi",
    },
    "operator": {
        api_call: "operator_type",
        display: "name_chi",
        api_query: "more",
        api_sub: "operators",
        display_sub: "name_chi",
        display_sub2: "name_eng",
    },
    "operator of type": {
        api_call: "operator",
        api_filter: "operator_type_id",
        display: "name_chi",
        display2: "name_eng",
    },
    /**
     * Prefecture
     */
    "prefecture_area": {
        api_call: "prefecture_area",
        display: "name_chi",
    },
    "prefecture": {
        api_call: "prefecture_area",
        display: "name_chi",
        api_query: "more",
        api_sub: "prefectures",
        display_sub: "name_chi_full",
        display_sub2: "name_eng_full",
    },
    "prefecture of area": {
        api_call: "prefecture",
        api_filter: "area_id",
        display: "name_chi_full",
        display2: "name_eng_full",
    },
    /**
     * Line
     */
    "line_type": {
        api_call: "line_type",
        display: "name_chi",
    },
    "line_group": {
        api_call: "line_group",
        display: "name_chi",
        display2: "name_eng",
    },
    "line": {
        api_call: "line_type",
        display: "name_chi",
        api_query: "more",
        api_sub: "lines",
        display_sub: "name_chi",
        display_sub2: "name_eng",
    },
    "line of type": {
        api_call: "lines",
        api_filter: "line_type_id",
        display: "name_chi",
        display2: "name_eng",
    },
    "line of group": {
        api_call: "lines",
        api_filter: "line_group_id",
        display: "name_chi",
        display2: "name_eng",
    },
    "line of operator": {
        api_call: "lines",
        api_filter: "operator_id",
        display: "name_chi",
        display2: "name_eng",
    },

    /**
     * Train Type / Name
     */
    "train_type": {
        api_call: "train_type",
        display: "name_chi",
        display2: "id",
    },
    "train_name": {
        api_call: "train_type",
        display: "name_chi",
        api_query: "more",
        api_sub: "trainNames",
        display_sub: "name_chi",
        display_sub2: "name_eng",
    },
    "train_name of type": {
        api_call: "train_name",
        api_filter: "train_type_id",
        display: "name_chi",
        display2: "name_eng",
    },

    /**
     * Vehicle Performance
     */
    "vehicle_performance_group": {
        api_call: "vehicle_performance_group",
        display: "name_chi",
    },
    "vehicle_performance_item": {
        api_call: "vehicle_performance_group",
        display: "name_chi",
        api_query: "more",
        api_sub: "items",
        display_sub: "name_chi",
        display_sub2: "id",
    },
    "vehicle_performance_item of group": {
        api_call: "vehicle_performance_item",
        api_filter: "group_id",
        display: "name_chi",
        display2: "id",
    },

    /**
     * Schedule Draft
     */
    "schdraft_category": {
        api_call: "schdraft_category",
        display: "title",
        display2: "id",
    },
    "schdraft_group": {
        api_call: "schdraft_category",
        display: "title",
        display2: "id",
        api_query: "groups",
        api_sub: "groups",
        display_sub: "title",
        display_sub2: "id",
    },
    "schdraft_group of category": {
        api_call: "schdraft_group",
        api_filter: "category_id",
        display: "title",
        display2: "id",
    },
    "schdraft_template": {
        api_call: "schdraft_group",
        display: "title",
        display2: "id",
        api_query: "templates",
        api_sub: "templates",
        display_sub: "title",
    },
    "schdraft_template of group": {
        api_call: "schdraft_template",
        api_filter: "group_id",
        display: "title",
    },
    "schdraft_template of category": {
        api_call: "schdraft_group",
        api_filter: "category_id",
        display: "title",
        display2: "id",
        api_query: "templates",
        api_sub: "templates",
        display_sub: "title",
    },

};