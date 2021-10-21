exports.menu = [
    {'href': "/operators", 'text': "營運者", 'sub': [
        {'href': "/operators", 'text': "營運者"},
        {'href': "/operators/types", 'text': "營運者類別"},
    ]},
    {'href': "/prefectures", 'text': "地區", 'sub': [
        {'href': "/prefectures", 'text': "都府縣省"},
        {'href': "/prefectures/areas", 'text': "廣域地區"},
    ]},
    {'href': "/lines", 'text': "路線", 'sub': [
        {'href': "/lines", 'text': "路線"},
        {'href': "/lines/groups", 'text': "路線組合"},
        {'href': "/lines/types", 'text': "路線類別"},
        {'href': "/lines/stats-hr", 'text': "HR的路線統計"},
    ]},
    {'href': "/stations", 'text': "車站"},
    {'href': "/trains/types", 'text': "列車/車輛", 'sub': [
        {'href': "/trains/types", 'text': "列車種別"},
        {'href': "/trains/names", 'text': "列車名稱"},
        {'href': "/vehicle-performances", 'text': "車輛性能"},
    ]},
    /*{'href': "/fares/hr", 'text': "票價", 'sub': [
        {'href': "/fares/hr", 'text': "HR票價"},
    ]},*/
    {'href': "/mapedit", 'text': "地圖編輯"},
    {'text': "時刻表", 'sub': [
        {'href': "/schdraft", 'text': "時刻表編輯"},
    ]},
    {'href': "/logout", 'text': "登出"},
];