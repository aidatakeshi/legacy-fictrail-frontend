exports.menu = [
    {'href': "/operators", 'text': "營運者"},
    {'href': "/lines", 'text': "路線", 'sub': [
        {'href': "/lines", 'text': "路線"},
        {'href': "/lines/stats", 'text': "HR的路線統計"},
    ]},
    {'href': "/stations", 'text': "車站"},
    {'href': "/train-types", 'text': "列車", 'sub': [
        {'href': "/train-types", 'text': "列車種別"},
        {'href': "/train-names", 'text': "列車名稱"},
    ]},
    {'href': "/vehicle-performances", 'text': "車輛", 'sub': [
        {'href': "/vehicle-performances", 'text': "車輛性能"},
    ]},
    {'href': "/fares/hr", 'text': "票價", 'sub': [
        {'href': "/fares/hr", 'text': "HR票價"},
    ]},
    {'href': "/map", 'text': "地圖編輯"},
    {'text': "時刻表", 'sub': [
        {'href': "/schdraft", 'text': "時刻表編輯"},
    ]},
    {'href': "/logout", 'text': "登出"},
];