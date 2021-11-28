<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPen, BIconX, BIconPencil } from 'bootstrap-vue'

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconPencil,
    },
    props: {
    },
    data() {
        return {
            data: null,
            data_line: {},
            line_id: null,
            direction: 'up',
            daytype: 'wk',
            showSeconds: false,
            showPass: false,
            template_id: null,
        };
    },
    watch: {

    },
    mounted(){

    },
    methods:{
        displayTime: $.displayTime,
        displayTimeInterval: $.displayTimeInterval,
        displaySignedNumber: $.displaySignedNumber,

        //Show Modal
        async show(id, direction = 'dn', template_id = null){
            this.line_id = id;
            this.direction = direction;
            this.template_id = template_id;
            //Load Data
            await this.loadData();
            //Open Modal
            this.$refs._modal.show();
            this.$forceUpdate();
        },

        //Load Data
        async loadData(){
            var $route = `schdraft-output/line/${encodeURIComponent(this.line_id)}/${this.direction}/${this.daytype}`;
            var response = await $.callAPI(axios, "GET", $route, {});
            if (response.http_status != 200) return false;
            this.data_line = response.data_line || {};
            this.data = response.data;
        },

        //Show Arrival / Departure?
        showArrival(i){
            if (!this.data?.stations) return null;
            if (i == 0) return false;
            if (i == this.data.stations.length - 1) return true;
            return this.data.stations?.[i]?.show_arrival;
        },
        showDeparture(i){
            if (!this.data?.stations) return null;
            if (i == 0) return true;
            if (i == this.data.stations.length - 1) return false;
            return true;
        },

        //Show Text
        showPassing(time = null, alt_text = ""){
            var str = "↓";
            if (time && this.showPass){
                var time_str = $.displayTime(time, !this.showSeconds, false, true);
                return time_str + str;
            }
            return alt_text + str;
        },
        showArriveDepart(time1 = null, time2 = null){
            if (time1 !== null) return $.displayTime(time1, !this.showSeconds);
            if (time2 !== null) return $.displayTime(time2, !this.showSeconds);
            return null;
        },

        //Get Cell Content
        getContent(trip, i){
            var showArrival = this.showArrival(i);
            var showDeparture = this.showDeparture(i);
            var item = trip.schedule_line?.[i] || null;
            var item_prev = trip.schedule_line?.[i-1] || null;
            var item_next = trip.schedule_line?.[i+1] || null;
            //Item Null Case
            if (item === null){
                if ((item_next||{}).is_thru_in){
                    var doubleRowNextItem = this.showArrival(i+1) && this.showDeparture(i+1);
                    if (doubleRowNextItem) return [];
                    if (!showArrival || !showDeparture) return [{text: '▲'}];
                    return [{}, {text: '▲'}];
                }
                if ((item_prev||{}).is_thru_out){
                    var doubleRowPrevItem = this.showArrival(i-1) && this.showDeparture(i-1);
                    if (doubleRowPrevItem) return [];
                    if (!showArrival || !showDeparture) return [{text: '▼'}];
                    return [{text: '▼'}, {}];
                }
            }
            //Double Item Case
            else if (showArrival && showDeparture){
                var $upper = {text: null, style: null};
                var $lower = {text: null, style: null};
                //Passing
                if (item.is_pass){
                    var $EXP = (item_prev||{}).is_express_track ? 'EXP' : '';
                    if (item.is_thru_in){
                        $upper = {text: '▲'};
                    }else{
                        $upper = {text: this.showPassing(item.time1, $EXP), style: 'passing'};
                    }
                    if (item.is_thru_out){
                        $lower = {text: '▼'};
                    }else{
                        $lower = {text: this.showPassing(item.time2, $EXP), style: 'passing'};
                    }
                }
                //Not Passing
                else{
                    if (item.is_thru_in){
                        $upper = {text: '▲'};
                    }else{
                        $upper = {text: this.showArriveDepart(item.time1), style: 'arriving'};
                    }
                    if (item.is_thru_out){
                        $lower = {text: '▼'};
                    }else{
                        $lower = {text: this.showArriveDepart(item.time2), style: 'departing'};
                    }
                }
                return [$upper, $lower];
            }
            //Single Item Case (Arrival only)
            else if (showArrival){
                //Passing
                if (item.is_pass){
                    var $time = (item.time1 !== null) ? item.time1 : item.time2;
                    var $EXP = (item_prev||{}).is_express_track ? 'EXP' : '';
                    return [{text: this.showPassing($time, $EXP), style: 'passing'}];
                }
                //Not Passing
                else{
                    return [{text: this.showArriveDepart(item.time1), style: 'arriving'}];
                }
            }
            //Single Item Case (Departure Only)
            else{
                //Passing
                if (item.is_pass){
                    var $time = (item.time1 !== null) ? item.time1 : item.time2;
                    var $EXP = (item_prev||{}).is_express_track ? 'EXP' : '';
                    return [{text: this.showPassing($time, $EXP), style: 'passing'}];
                }
                //Not Passing
                else{
                    return [{text: this.showArriveDepart(item.time2, item.time1), style: 'departing'}];
                }
            }
            //Default
            return [];
        },

        /**
         * CSS Related
         */
        getHeaderCellColorStyle(obj){
            return {'background-color': obj.color, 'color': obj.color_text};
        },
        getTripCellStyle(trip, index = null){
            var arr = [];
            if (trip.schdraft_template_id == this.template_id) arr.push('highlight');
            if (index !== null){
                var a1 = trip.schedule_line?.[index]?.is_express_track;
                var a2 = trip.schedule_line?.[index]?.no_tracks >= 4;
                var b1 = trip.schedule_line?.[index - 1]?.is_express_track;
                var b2 = trip.schedule_line?.[index - 1]?.no_tracks >= 4;
                if ((a1 && a2) || (b1 && b2)) arr.push('express-track');
            }
            return arr;
        },
    },
}
</script>

<template>
    <div>
        <!-- Main Modal -->
        <b-modal ref="_modal" centered scrollable size="xl" hide-footer
        header-bg-variant="dark" header-text-variant="light" :title="data_line.name_chi"
        body-class="p-0" @hide="$emit('hide')">
        <div class="p-2">

            <!-- Navigation Button -->
            <div class="d-flex align-items-center flex-wrap">
                <b-button class="mx-1" :variant="(direction == 'dn') ? 'primary' : 'outline-primary'" size="sm"
                @click="direction = 'dn'; loadData();">
                    下行
                </b-button>
                <b-button class="mx-1" :variant="(direction == 'up') ? 'primary' : 'outline-primary'" size="sm"
                @click="direction = 'up'; loadData();">
                    上行
                </b-button>
                <b-button class="mx-1" :variant="(daytype == 'wk') ? 'success' : 'outline-success'" size="sm"
                @click="daytype = 'wk'; loadData();">
                    平日
                </b-button>
                <b-button class="mx-1" :variant="(daytype == 'ph') ? 'danger' : 'outline-danger'" size="sm"
                @click="daytype = 'ph'; loadData();">
                    假日
                </b-button>

                <b-form-checkbox class="mx-1" switch v-model="showSeconds">顯示秒數</b-form-checkbox>
                <b-form-checkbox class="mx-1" switch v-model="showPass">顯示通過時間</b-form-checkbox>
            </div>

            <!-- No Schedule? -->
            <b-card class="mt-4" body-class="text-center py-4" v-if="!((data||{}).schedule||[]).length">
                未有時刻表可用
            </b-card>

            <!-- Table -->
            <div class=" mt-4" v-else>
                <table class="table table-bordered my-table" style="font-size: 0.8rem;">
                    <!-- Header ------------------------------------------------------------>
                    <thead>
                        <tr class="thead-light sticky-top">
                            <th class="sticky-left"></th>
                            <th />
                            <th />
                            <template v-for="(trip, i) in data.schedule">
                                <th colspan="2" :key="i" v-if="trip.train_name" :style="getHeaderCellColorStyle(trip.train_name)">
                                    {{trip.train_name.name_chi}}
                                    <div class="train_number" v-if="trip.train_number">
                                        {{trip.train_number}}號
                                    </div>
                                </th>
                                <th colspan="2" :key="i" v-else :style="getHeaderCellColorStyle(trip.train_type)">
                                    {{trip.train_type.name_chi}}
                                    <div class="train_number" v-if="trip.train_number">
                                        {{trip.train_number}}號
                                    </div>
                                </th>
                            </template>
                        </tr>
                        <tr class="thead-light">
                            <th class="sticky-left">班次號碼</th>
                            <th />
                            <th />
                            <th colspan="2" v-for="(trip, i) in data.schedule" :key="i">
                                {{trip.trip_number}}
                            </th>
                        </tr>
                        <tr class="thead-light">
                            <th class="sticky-left">起點</th>
                            <th />
                            <th />
                            <th colspan="2" v-for="(trip, i) in data.schedule" :key="i">
                                {{trip.station_begin_name_chi.substring(0, 4)}}
                            </th>
                        </tr>
                        <tr class="thead-light">
                            <th class="sticky-left">終點</th>
                            <th />
                            <th />
                            <th colspan="2" v-for="(trip, i) in data.schedule" :key="i">
                                {{trip.station_terminate_name_chi.substring(0, 4)}}
                            </th>
                        </tr>
                        <tr class="thead-light">
                            <th class="sticky-left">基準時間</th>
                            <th />
                            <th />
                            <th colspan="2" v-for="(trip, i) in data.schedule" :key="i">
                                {{displayTime(trip.pivot_time, true)}}<small>{{displaySignedNumber(trip.pivot_shift)}}</small>
                            </th>
                        </tr>
                    </thead>
                    <!-- Body -------------------------------------------------------------->
                    <tbody>
                        <!-- Top Additional Row -->
                        <tr>
                            <td class="header-col sticky-left"></td>
                            <td class="header-col"></td>
                            <td class="header-col"></td>
                            <template v-for="(trip, j) in data.schedule">
                                <td :key="j+'a'" :class="getTripCellStyle(trip)">
                                    <div v-for="(content, n) in getContent(trip, -1)" :key="n">
                                        <span v-if="!content.text">&nbsp;</span>
                                        <span v-else :class="content.style">{{content.text}}</span>
                                    </div>
                                </td>
                                <td :key="j+'b'" :class="getTripCellStyle(trip)"></td>
                            </template>
                        </tr>
                        <!-- Main Rows -->
                        <tr v-for="(station, i) in data.stations" :key="i">
                            <!-- Station -->
                            <td class="header-col sticky-left">
                                <strong>
                                    {{station.name_chi}}
                                </strong>
                            </td>
                            <td class="header-col mileage">
                                {{station.mileage_km.toFixed(1)}}k
                            </td>
                            <td class="header-col" style="width: 1rem;">
                                <div v-if="showArrival(i)" class="arriving">着</div>
                                <div v-if="showDeparture(i)" class="departing">發</div>
                            </td>
                            <!-- For Each Trip -->
                            <template v-for="(trip, j) in data.schedule">
                                <td :key="j+'a'" :class="getTripCellStyle(trip, i)">
                                    <div v-for="(content, n) in getContent(trip, i)" :key="n">
                                        <span v-if="!content.text">&nbsp;</span>
                                        <span v-else :class="content.style">{{content.text}}</span>
                                    </div>
                                </td>
                                <td :key="j+'b'" class="track_no" :class="getTripCellStyle(trip)">
                                    <template v-if="item = trip.schedule_line[i]">
                                        <div class="track_no" v-if="item.track">
                                            {{item.track}}
                                        </div>
                                    </template>
                                </td>
                            </template>
                        </tr>
                        <!-- Bottom Additional Row -->
                        <tr>
                            <td class="header-col sticky-left"></td>
                            <td class="header-col"></td>
                            <td class="header-col"></td>
                            <template v-for="(trip, j) in data.schedule">
                                <td :key="j+'a'" :class="getTripCellStyle(trip)">
                                    <div v-for="(content, n) in getContent(trip, (trip.schedule_line||[]).length)" :key="n">
                                        <span v-if="!content.text">&nbsp;</span>
                                        <span v-else :class="content.style">{{content.text}}</span>
                                    </div>
                                </td>
                                <td :key="j+'b'" :class="getTripCellStyle(trip)"></td>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
        </b-modal>
    </div>
</template>

<style scoped>
.sticky-left{
    position: sticky;
    left: 0;
}
.sticky-top{
    position: sticky;
    top: 0;
}
.track_no{
    color: #ccc;
    font-size: 0.6rem;
}
.arriving{
    text-decoration: underline;
}
.departing{
    font-weight: bold;
}
.passing{
    color: #999;
    font-size: 0.6rem;
}
.express-track{
    color: #00c;
}
.express-track .passing{
    color: #99f;
}
.mileage{
    font-size: 0.6rem;
}
.highlight{
    background-color: rgba(255, 255, 0, 0.2);
}
.train_number{
    font-size: 0.7rem;
}
</style>