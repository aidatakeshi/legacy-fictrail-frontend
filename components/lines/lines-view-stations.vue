<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPencil, BIconPlus } from 'bootstrap-vue'

    export default {

        props: {
            lineId: null,
        },
        components: { BIcon, BIconPencil, BIconPlus },

        data() {
            return {
                data_line: {},
                data: [],
                item_selected: {},
                additional_time_types: {
                    'upbound': '上行',
                    'downbound': '下行',
                    'local': '慢線',
                    'express': '快線',
                    'stop_up': '上停',
                    'pass_up': '上通',
                    'stop_down': '下停',
                    'pass_down': '下通',
                },
                editing_additional_time: {
                    basic: 0,
                    upbound: 0, downbound: 0, local: 0, express: 0,
                    stop_up: 0, pass_up: 0, stop_down: 0, pass_down: 0,
                },
                editing_remarks: null,
            }
        },

        async mounted(){
            //Load Line
            var response = await $.callAPI(axios, "GET", "items/lines/"+encodeURI(this.lineId), {});
            if (response.http_status != 200) return false;
            this.data_line = response.data;

            //Load Stations
            this.loadData();
        },

        methods: {
            async loadData(){
                var response = await $.callAPI(axios, "GET", "items/lines_stations", {
                    sort: "sort", filter: {"line_id": this.lineId},
                    fields: [
                        "*",
                        "station_id.name_chi", "station_id.name_eng", "station_id.prefecture_id.*",
                    ].join(','),
                });
                if (response.http_status != 200) return false;
                this.data = response.data;
            },

            //Show Arrival
            async toggleShowArrival(item){
                var newValue = !item.show_arrival;
                var response = await $.callAPI(axios, "PATCH", "items/lines_stations/"+encodeURI(item.id), {
                    show_arrival: newValue,
                });
                if (response.http_status != 200) return false;
                this.loadData();
            },

            //Speed
            async setSpeed(item){
                var msg = "請輸入速度 (km/h)，路線預設速度請留空。";
                if (item.max_speed_kph){
                    var value = prompt(msg, item.max_speed_kph)
                }else{
                    var value = prompt(msg);
                }
                if (value === null) return false;
                value = parseInt(value);
                if (isNaN(value)) var value = null;
                var response = await $.callAPI(axios, "PATCH", "items/lines_stations/"+encodeURI(item.id), {
                    max_speed_kph: value,
                });
                if (response.http_status != 200) return false;
                this.loadData();
            },

            //Tracks
            showSetTracksModal(item){
                this.item_selected = item;
                this.$refs.set_tracks_modal.show();
            },

            async setTracks(item, noTracks){
                var response = await $.callAPI(axios, "PATCH", "items/lines_stations/"+encodeURI(item.id), {
                    no_tracks: noTracks,
                });
                if (response.http_status != 200) return false;
                this.loadData();
                this.$refs.set_tracks_modal.hide();
            },

            //Additional Time
            showSetAdditionalTimeModal(item){
                this.item_selected = item;
                this.editing_additional_time.basic = 0;
                for (var key in this.editing_additional_time){
                    this.editing_additional_time[key] = 0;
                }
                if (item.additional_time){
                    for (var key in item.additional_time){
                        this.editing_additional_time[key] = item.additional_time[key];
                    }
                }
                this.$forceUpdate();
                this.$refs.set_additional_time_modal.show();
            },

            additionalTimeSet(item){
                var obj = item.additional_time || {};
                var count = 0;
                for (var i in obj){
                    if (obj[i]) count++;
                }
                return count;
            },

            plusMinus(value){
                value = value * 1;
                if (value > 0) return '+' + value;
                if (!value) return 'n/a';
                return value;
            },

            async setAdditionalTime(item){
                for (var i in this.editing_additional_time){
                    this.editing_additional_time[i] = (this.editing_additional_time[i] * 1) || 0;
                }
                var response = await $.callAPI(axios, "PATCH", "items/lines_stations/"+encodeURI(item.id), {
                    additional_time: this.editing_additional_time,
                });
                if (response.http_status != 200) return false;
                this.loadData();
                this.$refs.set_additional_time_modal.hide();
            },

            //Remarks
            showSetRemarksModal(item){
                this.item_selected = item;
                this.editing_remarks = item.remarks;
                this.$forceUpdate();
                this.$refs.set_remarks_modal.show();
            },

            async setRemarks(item){
                var response = await $.callAPI(axios, "PATCH", "items/lines_stations/"+encodeURI(item.id), {
                    remarks: this.editing_remarks,
                });
                if (response.http_status != 200) return false;
                this.loadData();
                this.$refs.set_remarks_modal.hide();
            }

        }

    }

</script>

<template>
    <div>
        <div class="table-responsive">
            <table class="table table-hover my-table">
                <thead class="thead-light">
                    <tr>
                        <th>#</th>
                        <th>車站</th>
                        <th style="line-height: 1rem;">里程<br/><small>(km)</small></th>
                        <th style="line-height: 1rem;">間距<br/><small>(km)</small></th>
                        <th style="line-height: 1rem;">顯示<br/>到着</th>
                        <th>線路數</th>
                        <th style="line-height: 1rem;">最高速度<br/><small>(km/h)</small></th>
                        <th>加算時間 <small>(s)</small></th>
                        <th>備註</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, i) in data" :key="i">
                        <th>#{{i}}</th>
                        <td class="text-left" style="line-height: 1rem;">
                            <span>{{(item.station_id||{}).name_chi}}</span>
                            <small>
                                ({{((item.station_id||{}).prefecture_id||{}).name_chi}}<!---
                            --->{{((item.station_id||{}).prefecture_id||{}).name_chi_suffix}})
                            </small>
                            <br/>
                            <small>{{(item.station_id||{}).name_eng}}</small>
                        </td>
                        <td>{{item.mileage_km}}</td>
                        <td>
                            <span v-if="i > 0">{{item.distance_km}}</span>
                            <span v-else>-</span>
                        </td>
                        <td>
                            <span v-if="i <= 0">-</span>
                            <b-button variant="outline-secondary" class="p-0" @click="toggleShowArrival(item)"
                            :disabled="i <= 0 || i >= (data.length - 1)" v-else>
                                <span v-if="i >= (data.length - 1)">✔️</span>
                                <span v-else>{{item.show_arrival ? '✔️' : '❌'}}</span>
                            </b-button>
                        </td>
                        <td class="mx-0">
                            <span v-if="i <= 0">-</span>
                            <b-button class="p-0" v-else-if="item.no_tracks == 1" variant="outline-success"
                            @click="showSetTracksModal(item)">單</b-button>
                            <b-button class="p-0" v-else-if="item.no_tracks == 4" variant="outline-primary"
                            @click="showSetTracksModal(item)">四</b-button>
                            <b-button class="p-0" v-else variant="outline-secondary"
                            @click="showSetTracksModal(item)">複</b-button>
                        </td>
                        <td>
                            <span v-if="i <= 0">-</span>
                            <b-button variant="outline-secondary" class="p-0" @click="setSpeed(item)"
                            :disabled="i <= 0" v-else-if="!item.max_speed_kph">
                                {{data_line.max_speed_kph}}
                            </b-button>
                            <b-button variant="outline-danger" class="p-0" @click="setSpeed(item)"
                            :disabled="i <= 0" v-else>
                                {{item.max_speed_kph}}
                            </b-button>
                        </td>
                        <td>
                            <span v-if="i <= 0">-</span>
                            <b-button variant="outline-secondary" class="p-0" @click="showSetAdditionalTimeModal(item)"
                            v-else-if="additionalTimeSet(item) == 0">
                                n/a
                            </b-button>
                            <b-button variant="outline-danger" class="p-0" @click="showSetAdditionalTimeModal(item)"
                            v-else-if="additionalTimeSet(item) == 1 && item.additional_time.basic">
                                {{plusMinus(item.additional_time.basic)}}
                            </b-button>
                            <b-button variant="outline-danger" class="p-0" @click="showSetAdditionalTimeModal(item)"
                            v-else style="line-height: 0.75rem; font-size: 0.5rem;">
                                <div>
                                    基本: {{plusMinus(item.additional_time.basic)}}
                                </div>
                                <template v-for="(name, key) in additional_time_types">
                                    <div :key="key" v-if="item.additional_time[key]">
                                        {{name}}: {{plusMinus(item.additional_time[key])}}
                                    </div>
                                </template>
                            </b-button>
                        </td>
                        <td>
                            <div class="d-flex align-items-center">
                                <div>
                                    <b-button variant="link" size="sm" @click="showSetRemarksModal(item)">
                                        <b-icon-pencil />
                                    </b-button>
                                </div>
                                <div class="remarks">{{item.remarks}}</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!---------------------------------------------------->
        <b-modal ref="set_tracks_modal" hide-header hide-footer size="sm" centered>
            <b-button @click="setTracks(item_selected, 1)" block>單線 (1)</b-button>
            <b-button @click="setTracks(item_selected, 2)" block>複線 (2)</b-button>
            <b-button @click="setTracks(item_selected, 4)" block>四線 (4)</b-button>
        </b-modal>

        <b-modal ref="set_remarks_modal" title="備註" hide-footer size="md" centered>
            <b-form-textarea size="sm" rows="5" v-model="editing_remarks" />
            <b-button block variant="primary" size="sm" class="mt-2" @click="setRemarks(item_selected)">
                提交
            </b-button>
        </b-modal>
        
        <b-modal ref="set_additional_time_modal" title="加算時間" hide-footer size="sm" centered>
            <div class="row">
                <div class="col-4">基本:</div>
                <div class="col-8">
                    <b-form-input type="number" v-model="editing_additional_time.basic" size="sm" />
                </div>
            </div>
            <div class="row" v-for="(name, key) in additional_time_types" :key="key">
                <div class="col-4">{{name}}:</div>
                <div class="col-8">
                    <b-form-input type="number" v-model="editing_additional_time[key]" size="sm" />
                </div>
            </div>

            <b-button block variant="primary" size="sm" class="mt-2" @click="setAdditionalTime(item_selected)">
                提交
            </b-button>

        </b-modal>
    </div>
</template>