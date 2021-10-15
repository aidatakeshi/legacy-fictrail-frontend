<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');
    const sd = require('~/schdraft.js');

    import { BIcon, BIconPencil, BIconPlus } from 'bootstrap-vue'
    import InputTime from './input-time.vue';
    import InputIntegerSigned from './input-integer-signed.vue';
    import TemplateScheduleAddDrop from './template-schedule-add-drop.vue';
    import TemplateScheduleRow from './template-schedule-row.vue';
    import TemplateModRuleEdit from './template-mod-rule-edit.vue';
    import TemplateDeployment from './template-deployment.vue';
    import LinesViewStations from '../lines/lines-view-stations.vue';

    export default {

        props: {
            templateId: String,
            notInModal: Boolean,
        },
        components: {
            BIcon, BIconPencil, BIconPlus,
            InputTime, InputIntegerSigned,
            TemplateScheduleAddDrop, TemplateScheduleRow, TemplateModRuleEdit, TemplateDeployment,
            LinesViewStations,
        },

        data() {
            return {
                data: {},
                data_vehicle_performance: {},
                data_lines: {}, //data_lines[line_id]
                data_stations: {}, //data_stations[station_id]
                data_lines_stations: {}, //data_lines_stations[line_id][station_id] ({order})
                schedule_splits: [],
                viewing_line_id: null,
                viewing_line_title: null,
                trigger: 0,
            }
        },

        async mounted(){
            //Load Template Data
            this.data = await $.getOneItem(axios, 'schdraft_templates', this.templateId);

            //schedule & mod should be array instead of object
            if (!Array.isArray(this.data.schedule)) this.data.schedule = [];
            if (!Array.isArray(this.data.mod)) this.data.mod = [];
            if (!Array.isArray(this.data.deployment.wk)) this.data.deployment.wk = [];
            if (!Array.isArray(this.data.deployment.ph)) this.data.deployment.ph = [];

            //Other initializations
            this.loadVehiclePerformance();
            this.handleLinesStationsUpdated();

        },

        methods: {
            displayTime: sd.displayTime,
            displayTimeInterval: sd.displayTimeInterval,

            //Open View Line Modal
            viewLine(line_id){
                this.viewing_line_id = line_id;
                this.viewing_line_title = (this.data_lines[line_id]||{}).name_chi;
                this.$refs.line_modal.show();
            },

            //Submit
            async submit(){
                //Save
                var url = "items/schdraft_templates/"+encodeURI(this.templateId);
                var response = await $.callAPI(axios, "PATCH", url, this.data);
                if (response.http_status == 200){
                    if (this.notInModal){
                        this.$bvToast.toast('已保存。', { title: `已保存。`, variant: 'success'});
                    }
                    this.$emit('submit');
                }
            },

            //Load Vehicle Performance
            async loadVehiclePerformance(){
                this.data_vehicle_performance = await $.getOneItem(axios, 'vehicle_performance_items', this.data.vehicle_performance_id);
            },

            //Handle Schedule Updated
            async handleLinesStationsUpdated(){
                await this.loadLinesInformation();
                await this.loadStationsInformation();
                await this.loadLinesStationsInformation();
                this.obtainScheduleSplits();
                this.updateLineIDsInvolved();
                this.updateStationIDsInvolved();
                this.trigger++;
            },

            //Load Lines Information
            async loadLinesInformation(){
                //Get Line IDs
                var obj = {};
                for (var i in this.data.schedule) obj[this.data.schedule[i].line_id] = true;
                var line_ids = Object.keys(obj);
                //Call API
                var response = await $.callAPI(axios, "GET", 'items/lines', {
                    'fields': 'id, color, name_chi, name_eng, max_speed_kph',
                    'filter': {'id': { "_in": line_ids }},
                });
                if (response.http_status != 200) return false;
                for (var i in response.data){
                    this.data_lines[response.data[i].id] = response.data[i];
                }
                this.$forceUpdate();
            },

            //Load Stations Information
            async loadStationsInformation(){
                //Get Station IDs
                var obj = {};
                for (var i in this.data.schedule) obj[this.data.schedule[i].station_id] = true;
                var station_ids = Object.keys(obj);
                //Call API
                var response = await $.callAPI(axios, "GET", 'items/stations', {
                    'fields': 'id, name_chi, name_eng, major, tracks, is_signal_only, is_abandoned, remarks',
                    'filter': {'id': { "_in": station_ids }},
                });
                if (response.http_status != 200) return false;
                for (var i in response.data){
                    this.data_stations[response.data[i].id] = response.data[i];
                }
                this.$forceUpdate();
            },

            //Load Lines Stations Information
            async loadLinesStationsInformation(){
                //Get Lines List
                var obj = {};
                for (var i in this.data.schedule){
                    if (this.data.schedule[i].line_id) obj[this.data.schedule[i].line_id] = true;
                }
                var line_ids = Object.keys(obj);
                //For each line, call API
                for (var i in line_ids){
                    this.data_lines_stations[line_ids[i]] = {};
                    var response = await $.callAPI(axios, "GET", 'items/lines_stations', {
                        'fields': [
                            'line_id, station_id, sort, distance_km, mileage_km',
                            'show_arrival, no_tracks, max_speed_kph, additional_time, remarks',
                        ].join(', '),
                        'filter': { line_id: line_ids[i] }, 'sort': 'sort',
                    });
                    if (response.http_status == 200){
                        for (var j in response.data){
                            if (j == 0) continue;
                            var line_id = line_ids[i];
                            var station_id = response.data[j].station_id;
                            this.data_lines_stations[line_id][station_id] = response.data[j];
                            this.data_lines_stations[line_id][station_id].order = null;
                        }
                    }
                }
                //Update order
                for (var order in this.data.schedule){
                    var line_id = this.data.schedule[order].line_id;
                    var station_id = this.data.schedule[order].station_id;
                    if (this.data_lines_stations?.[line_id]?.[station_id]){
                        this.data_lines_stations[line_id][station_id].order = parseInt(order);
                    }
                }
                this.$forceUpdate();
            },

            //Split Schedule Splits (Group by Line & Direction)
            //schedule_splits[i] = { line_id, is_upbound, min_i, max_i }
            obtainScheduleSplits(){
                var line_id_prev = null;
                var is_upbound_prev = null;
                this.schedule_splits = [];
                for (var i = 1; i < this.data.schedule.length; i++){
                    var item = this.data.schedule[i];
                    if (item.line_id != line_id_prev || item.is_upbound != is_upbound_prev){
                        this.schedule_splits.push({
                            line_id: item.line_id, is_upbound: item.is_upbound, min_i: i-1, max_i: i,
                        });
                        line_id_prev = item.line_id;
                        is_upbound_prev = item.is_upbound;
                    }else{
                        this.schedule_splits[this.schedule_splits.length - 1].max_i = i;
                    }
                }
            },

            //Updated Lines / Stations Involved List
            updateLineIDsInvolved(){
                var obj = {};
                for (var i in this.data.schedule){
                    if (this.data.schedule[i].line_id) obj[this.data.schedule[i].line_id] = true;
                }
                this.data.line_ids_involved = '|' + Object.keys(obj).join('|') + '|';
            },
            updateStationIDsInvolved(){
                var obj = {};
                for (var i in this.data.schedule){
                    if (this.data.schedule[i].station_id) obj[this.data.schedule[i].station_id] = true;
                }
                this.data.station_ids_involved = '|' + Object.keys(obj).join('|') + '|';
            },

            //Get Number Range
            range(a, b){
                var arr = [];
                for (var i = a; i <= b; i++) arr.push(i);
                return arr;
            },

            //Calculate Total Travel Time
            min_total_travel_time_s(){
                if (!Array.isArray(this.data.schedule)) return null;
                var total = 0;
                for (var i = 1; i < this.data.schedule.length; i++){
                    var line_id = this.data.schedule[i]?.line_id;
                    var station_id = this.data.schedule?.[i - (this.data.schedule[i].is_upbound ? 1 : 0)]?.station_id;
                    if (!line_id || !station_id) return null;
                    var line = this.data_lines[line_id];
                    var section = this.data_lines_stations?.[line_id]?.[station_id];
                    var performance = this.data_vehicle_performance;
                    if (!line || !section || !performance) return null;
                    var isUpbound = this.data.schedule[i]?.is_upbound;
                    var isExpress = this.data.schedule[i]?.is_express_track;
                    var isPassPrev = !!this.data.schedule[i-1]?.pass_time;
                    var isPassNext = !!this.data.schedule[i]?.pass_time;
                    total += sd.minTravelTime(line, section, performance, isUpbound, isExpress, isPassPrev, isPassNext);
                }
                return total;
            },

            scheduled_total_travel_time_s(){
                if (!Array.isArray(this.data.schedule)) return null;
                var total = 0;
                for (var i = 1; i < this.data.schedule.length; i++){
                    var b = this.data.schedule[i].arrive_time || this.data.schedule[i].pass_time;
                    var a = this.data.schedule[i-1].depart_time || this.data.schedule[i-1].pass_time;
                    total += (b - a);
                }
                return total;
            },

        }

    }

</script>

<template>
    <div>
        <!-- 基本資料 -------------------------------------------------------------------------------------->
        <b-card class="my-4">
            <h2>基本資料</h2><hr class="mt-0" />
            <div class="row" style="max-width: 40rem; margin: 0 auto;">
                <div class="col-sm-6">模板名稱</div>
                <div class="col-sm-6">
                    <b-form-input v-model="data.title" />
                </div>
                <div class="col-sm-6">列車種別</div>
                <div class="col-sm-6">
                    <div class="d-flex">
                        <select-generic class="flex-grow-1"
                            type="train_types" sort="-sort"
                            operator-attr = "operator_id"
                            v-model="data.train_type_id"
                        />
                        <select-generic-mod type="train_types" sort="-sort"
                        operator-attr = "operator_id" v-model="data.train_type_mod"
                        variant="outline-info" class="px-2" @input="$forceUpdate()">
                            <b-icon-pencil />
                        </select-generic-mod>
                    </div>
                    <small v-if="Object.keys(data.train_type_mod || {}).length">
                        Mods: {{Object.keys(data.train_type_mod || {})}}
                    </small>
                </div>
                <div class="col-sm-6">列車名稱</div>
                <div class="col-sm-6">
                    <div class="d-flex">
                        <select-generic class="flex-grow-1"
                            type="train_types" sort="-sort"
                            sub-type="train_names" sub-sort="major_operator_id, name_eng" foreign-id="train_type_id"
                            operator-attr = "major_operator_id"
                            v-model="data.train_name_id"
                        />
                        <select-generic-mod type="train_types" sort="-sort"
                        sub-type="train_names" sub-sort="major_operator_id, name_eng" foreign-id="train_type_id"
                        operator-attr = "major_operator_id" v-model="data.train_name_mod"
                        variant="outline-info" class="px-2" @input="$forceUpdate()">
                            <b-icon-pencil />
                        </select-generic-mod>
                    </div>
                    <small v-if="Object.keys(data.train_name_mod || {}).length">
                        Mods: {{Object.keys(data.train_name_mod || {})}}
                    </small>
                </div>
                <div class="col-sm-6">性能設定</div>
                <div class="col-sm-6">
                    <select-generic
                        type="vehicle_performance_groups" sort="sort"
                        sub-type="vehicle_performance_items" sub-sort="id" foreign-id="group_id"
                        v-model="data.vehicle_performance_id" @change="loadVehiclePerformance"
                    />
                </div>
                <div class="col-sm-6">方向</div>
                <div class="col-sm-6">
                    <b-form-select v-model="data.is_upbound">
                        <b-form-select-option :value="false">下行</b-form-select-option>
                        <b-form-select-option :value="true">上行</b-form-select-option>
                    </b-form-select>
                </div>
                <div class="col-sm-6">基準時間 (排序調整)</div>
                <div class="col-sm-6 d-flex">
                    <input-time v-model="data.pivot_time" original-class placeholder="基準時間">
                    </input-time>
                    <input-integer-signed v-model="data.pivot_time_adj" original-class placeholder="排序調整">
                    </input-integer-signed>
                </div>
                <div class="col-sm-6">啟用模板？</div>
                <div class="col-sm-6 py-1">
                    <b-form-checkbox switch v-model="data.is_enabled" />
                </div>
                <div class="col-sm-12">
                    備註：<br/>
                    <b-form-textarea v-model="data.remarks" rows="5" size="sm" />
                </div>
            </div>

            <!-- Submit -->
            <div class="text-center mt-3">
                <b-button variant="primary" style="width: 100%; max-width: 15rem;" @click="submit()">
                    保存
                </b-button>
            </div>

        </b-card>

        <!-- 時刻 -------------------------------------------------------------------------------------->
        <b-card class="my-4">
            <h2>時刻 <small>(對應基準時間)</small></h2><hr class="mt-0" />

            <template-schedule-add-drop v-model="data.schedule" @input="handleLinesStationsUpdated()">
                <div class="table-responsive mb-0">
                    <table class="table table-bordered my-table"
                    :let="cum_mileage = 0">
                        <thead class="thead-light">
                            <tr>
                                <th>車站</th>
                                <th style="width: 2rem;"></th>
                                <th style="line-height: 1em; width: 5rem;">
                                    時刻<br/><small>(預設)</small>
                                </th>
                                <th style="width: 2rem;"></th>
                                <th style="line-height: 1em;">
                                    月台<small>/軌道</small><br/><small>&amp;快慢線</small>
                                </th>
                                <th style="line-height: 1em;">Mods</th>
                                <th style="line-height: 1em;">距離<br/><small>(km)</small></th>
                                <th style="line-height: 1em;">里程<br/><small>(km)</small></th>
                                <th>限制 / 備註</th>
                                <th style="width: 3rem;"></th>
                            </tr>
                        </thead>
                        <tbody class="small" v-for="(s, i) in schedule_splits" :key="i">
                            <!-- Line Title -->
                            <tr>
                                <td class="table-dark" colspan="20">
                                    <div class="d-flex align-items-center">
                                        <div style="font-size: 0.9rem;">
                                            <color-box :color="(data_lines[s.line_id]||{}).color" />
                                            {{(data_lines[s.line_id]||{}).name_chi}}
                                            ({{s.is_upbound ? '上行' : '下行'}})
                                        </div>
                                        <b-button variant="link" size="sm" class="ml-auto mr-1"
                                        @click="viewLine(s.line_id)">
                                            <b-icon-pencil class="text-light" />
                                        </b-button>
                                    </div>
                                </td>
                            </tr>
                            <!-- Stations on the Line -->
                            <template-schedule-row v-for="j in range(s.min_i, s.max_i)" :key="j"
                                v-model="data.schedule[j]"
                                :prev="data.schedule[j-1]||{}"
                                :next="data.schedule[j+1]||{}"
                                :let1="station_id = data.schedule[j].station_id"
                                :let2="station_id2 = (data.schedule[j - (s.is_upbound ? 1 : 0)]||{}).station_id"
                                :let3="section = (data_lines_stations[s.line_id]||{})[station_id2]||{}"
                                :line="data_lines[s.line_id]||{}"
                                :is-upbound="s.is_upbound"
                                :station="data_stations[data.schedule[j].station_id]||{}"
                                :section="section"
                                :vehicle-performance="data_vehicle_performance"
                                :distance="distance = section.distance_km"
                                :mileage="cum_mileage = (cum_mileage - (section.distance_km || 0) * -1).toFixed(1)"
                                :hide-arrive="j == s.min_i" :hide-depart="j == s.max_i"
                                :is-first="j <= 0" :is-last="j >= data.schedule.length - 1"
                            />
                        </tbody>
                    </table>
                </div>
                <div style="font-size: 90%;">
                    餘裕行走時間：{{displayTimeInterval(scheduled_total_travel_time_s() - min_total_travel_time_s())}}
                    ({{(scheduled_total_travel_time_s() / min_total_travel_time_s() * 100 - 100).toFixed(3)}}%)
                </div>
            </template-schedule-add-drop>


            <!-- Submit -->
            <div class="text-center mt-3">
                <b-button variant="primary" style="width: 100%; max-width: 15rem;" @click="submit()">
                    保存
                </b-button>
            </div>

        </b-card>

        <!-- Mod設定規則 -------------------------------------------------------------------------------------->
        <b-card class="my-4">
            <h2>Mod設定規則</h2><hr class="mt-0" />
            <template-mod-rule-edit v-model="data.mods" style="max-width: 40rem; margin: 0 auto;"
                :schedule="data.schedule" @input="$forceUpdate()"
            />

            <!-- Submit -->
            <div class="text-center mt-3">
                <b-button variant="primary" style="width: 100%; max-width: 15rem;" @click="submit()">
                    保存
                </b-button>
            </div>
        </b-card>

        <!-- 班次安排 -------------------------------------------------------------------------------------->
        <b-card class="my-4">
            <h2>班次安排</h2><hr class="mt-0" />
            <div class="row">
                <div class="col-lg-6">
                    <b-card body-class="pt-0 px-1 pb-1" header="平日" class="mb-2"
                    header-bg-variant="info" header-text-variant="light"
                    header-class="p-1 text-center font-weight-bold">
                        <template-deployment v-model="(data.deployment||{}).wk" :trigger="trigger"
                            :schedule="data.schedule" :data-stations="data_stations"
                        />
                    </b-card>
                    <div class="text-center">
                        <b-button variant="outline-secondary" class="px-2 py-0"
                        @click="data.deployment.wk = JSON.parse(JSON.stringify(data.deployment.ph))">
                            設定至與假日相同
                        </b-button>
                    </div>
                </div>
                <div class="col-lg-6">
                    <b-card body-class="pt-0 px-1 pb-1" header="假日" class="mb-2"
                    header-bg-variant="danger" header-text-variant="light"
                    header-class="p-1 text-center font-weight-bold">
                        <template-deployment v-model="(data.deployment||{}).ph" :trigger="trigger"
                            :schedule="data.schedule" :data-stations="data_stations"
                        />
                    </b-card>
                    <div class="text-center">
                        <b-button variant="outline-secondary" class="px-2 py-0"
                        @click="data.deployment.ph = JSON.parse(JSON.stringify(data.deployment.wk))">
                            設定至與平日相同
                        </b-button>
                    </div>
                </div>
            </div>

            <!-- Submit -->
            <div class="text-center mt-3">
                <b-button variant="primary" style="width: 100%; max-width: 15rem;" @click="submit()">
                    保存
                </b-button>
            </div>

        </b-card>

        <!-- 查看JSON -------------------------------------------------------------------------------------->
        <div class="text-center mt-2 mb-4">
            <b-button variant="secondary" style="width: 100%; max-width: 15rem;"
            @click="$refs.JSON.show()">查看JSON</b-button>
        </div>

        <b-modal ref="JSON" title="JSON" hide-footer centered scrollable size="lg">
            <vue-json-pretty :data="data" />
        </b-modal>

        <!-- View Line ------------------------------------------------------------------------------------->
        <b-modal ref="line_modal" centered scrollable hide-footer :title="viewing_line_title" size="xl"
        @hidden="loadLinesStationsInformation">
            <lines-view-stations :line-id="viewing_line_id" v-if="viewing_line_id" />
        </b-modal>

        <!---------------------------------------------------------------------------------------->
    </div>
</template>