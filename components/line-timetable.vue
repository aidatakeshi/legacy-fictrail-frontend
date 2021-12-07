<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPen, BIconX, BIconPencil, BIconArrowClockwise } from 'bootstrap-vue'

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconPencil, BIconArrowClockwise,
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
            showAllArrival: false,
            template_id: null,
            showing: false,
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
            this.showing = true;
            if (typeof window !== 'undefined'){
                window.addEventListener('resize', this.handleScreenResized);
            }
            if (typeof document !== 'undefined'){
                document.body.style.overflow = 'hidden';
            }
            this.$forceUpdate();
        },

        //Hide
        hide(){
            if (typeof window !== 'undefined'){
                window.removeEventListener('resize', this.handleScreenResized);
            }
            if (typeof document !== 'undefined'){
                document.body.style.overflow = 'visible';
            }
            this.showing = false;
            this.$emit('hide');
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
            return this.data.stations?.[i]?.show_arrival || this.showAllArrival;
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
                else if (item.time2 !== null){
                    return [{text: this.showArriveDepart(item.time2), style: 'departing'}];
                }else{
                    return [{text: this.showArriveDepart(item.time1), style: 'arriving'}];
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
            if (trip.is_temp) arr.push('temp-train');
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
        <div class="overlay" v-if="showing">

            <div class="title">
                {{data_line.name_chi}}
                <small>
                    (
                    {{{'up': '上行 /', 'dn': '下行 /'}[direction]}}
                    {{{'wk': '平日', 'ph': '假日'}[daytype]}}
                    )
                </small>
                時刻表
            </div>

            <!-- Close Button -->
            <b-button variant="link" class="close-btn py-1 px-2" @click="hide()">
                <b-icon-x variant="dark" scale="1.4" />
            </b-button>

            <!-- Navigation Button -->
            <div class="timetable-nav">
                <div class="d-flex align-items-center flex-wrap">
                    <b-button class="py-0" variant="primary" size="sm" v-if="direction == 'dn'"
                    @click="direction = 'up'; loadData();">
                        下行
                    </b-button>
                    <b-button class="py-0" variant="primary" size="sm" v-if="direction == 'up'"
                    @click="direction = 'dn'; loadData();">
                        上行
                    </b-button>
                    <b-button class="py-0" variant="success" size="sm" v-if="daytype == 'wk'"
                    @click="daytype = 'ph'; loadData();">
                        平日
                    </b-button>
                    <b-button class="py-0" variant="danger" size="sm" v-if="daytype == 'ph'"
                    @click="daytype = 'wk'; loadData();">
                        假日
                    </b-button>
                    <b-button class="py-0" variant="outline-secondary" size="sm" @click="loadData();">
                        <b-icon-arrow-clockwise />
                    </b-button>
                    <b-button class="py-0" :variant="showSeconds ? 'info' : 'outline-info'" size="sm"
                    @click="showSeconds = !showSeconds">
                        秒數
                    </b-button>
                    <b-button class="py-0" :variant="showPass ? 'info' : 'outline-info'" size="sm"
                    @click="showPass = !showPass">
                        通過時
                    </b-button>
                    <b-button class="py-0" :variant="showAllArrival ? 'info' : 'outline-info'" size="sm"
                    @click="showAllArrival = !showAllArrival">
                        到着時
                    </b-button>
                </div>
            </div>

            <!-- No Schedule? -->

            <!-- Table -->
            <div class="main">
                <b-card class="mt-4" body-class="text-center py-4" v-if="!((data||{}).schedule||[]).length">
                    未有時刻表可用
                </b-card>
                <div v-else class="table-responsive w-100 h-100">
                    <table class="table table-bordered my-table" style="font-size: 0.8rem;">
                        <!-- Header ------------------------------------------------------------>
                        <thead>
                            <tr class="thead-light sticky-top">
                                <th class="sticky-left"></th>
                                <th />
                                <th />
                                <template v-for="(trip, i) in data.schedule">
                                    <th colspan="2" :key="i" :style="getHeaderCellColorStyle(trip.train_name || trip.train_type)">
                                        <a :href="`/schdraft/template/${encodeURIComponent(trip.schdraft_template_id)}`"
                                        target="_blank" :style="getHeaderCellColorStyle(trip.train_name || trip.train_type)">
                                            {{trip.train_name.name_chi || trip.train_type.name_chi}}
                                            <div class="train_number" v-if="trip.train_number">
                                                {{trip.train_number}}號
                                            </div>
                                        </a>
                                    </th>
                                </template>
                            </tr>
                            <tr class="thead-light">
                                <th class="sticky-left">起點</th>
                                <th />
                                <th />
                                <th colspan="2" v-for="(trip, i) in data.schedule" :key="i"
                                @click="template_id = trip.schdraft_template_id">
                                    {{trip.station_begin_name_chi.substring(0, 4)}}
                                </th>
                            </tr>
                            <tr class="thead-light">
                                <th class="sticky-left">終點</th>
                                <th />
                                <th />
                                <th colspan="2" v-for="(trip, i) in data.schedule" :key="i"
                                @click="template_id = trip.schdraft_template_id">
                                    {{trip.station_terminate_name_chi.substring(0, 4)}}
                                </th>
                            </tr>
                            <tr class="thead-light">
                                <th class="sticky-left">班次號碼</th>
                                <th />
                                <th />
                                <th colspan="2" v-for="(trip, i) in data.schedule" :key="i"
                                @click="template_id = trip.schdraft_template_id">
                                    {{trip.trip_number}}
                                </th>
                            </tr>
                            <tr class="thead-light">
                                <th class="sticky-left">備註</th>
                                <th />
                                <th />
                                <th colspan="2" v-for="(trip, i) in data.schedule" :key="i" class="trip-remarks"
                                @click="template_id = trip.schdraft_template_id">
                                    <div class="small">
                                        基準{{displayTime(trip.pivot_time, true, true)}}
                                    </div>
                                    <div class="small" v-if="trip.pivot_shift">
                                        調整{{displaySignedNumber(trip.pivot_shift / 60)}}
                                    </div>
                                    <b-badge variant="warning" v-if="trip.is_temp">臨時</b-badge>
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
        </div>
    </div>
</template>

<style scoped>
.overlay{
    position: fixed;
    width: 100%; height: 100%;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: white;
    z-index: 101;
}
.main{
    position: fixed;
    top: 32px; bottom: 32px;
    left: 0; right: 0;
    z-index: 1;
}
.title{
    position: fixed;
    left: 5px; top: 1px;
    font-size: 1.2rem;
    font-weight: bold;
    z-index: 2;
}
.timetable-nav{
    position: fixed;
    left: 5px; bottom: 3px;
    z-index: 3,
}
.close-btn{
    position: fixed;
    right: 0; top: 0;
    z-index: 5;
}
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
.temp-train{
    color: rgb(197, 161, 0) !important;
}
.temp-train .passing{
    color: rgb(197, 161, 0) !important;
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
.trip-remarks{
    font-weight: normal;
    vertical-align: top !important;
}
.trip-remarks .small{
    font-size: 80%;
    text-align: center;
}
</style>