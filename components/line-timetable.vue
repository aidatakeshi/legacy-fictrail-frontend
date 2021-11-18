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

        //Show Passing
        showPassing(time){
            var str = "↓";
            if (time && this.showPass){
                var time_str = $.displayTime(time, !this.showSeconds, false, true);
                str = time_str + str;
            }
            return str;
        },

        //Is Thru In
        isThruIn(trip, i){
            if (i != trip.begin_index) return false;
            if (this.data.stations?.[i]?.station_id == trip.station_begin_id) return false;
            return true;
        },

        //Is Thru Out
        isThruOut(trip, i){
            if (i != trip.terminate_index) return false;
            if (this.data.stations?.[i]?.station_id == trip.station_terminate_id) return false;
            return true;
        },

        //Get Cell Color Style
        getCellColorStyle(obj){
            return {'background-color': obj.color, 'color': obj.color_text};
        }
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
                                <th colspan="2" :key="i" v-if="trip.train_name" :style="getCellColorStyle(trip.train_name)">
                                    {{trip.train_name.name_chi}}
                                    <div class="train_number" v-if="trip.train_number">
                                        {{trip.train_number}}號
                                    </div>
                                </th>
                                <th colspan="2" :key="i" v-else :style="getCellColorStyle(trip.train_type)">
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
                    </thead>
                    <!-- Body -------------------------------------------------------------->
                    <tbody>
                        <!-- Top Additional Row -->
                        <tr>
                            <td class="header-col sticky-left"></td>
                            <td class="header-col"></td>
                            <td class="header-col"></td>
                            <template v-for="(trip, j) in data.schedule">
                                <td :key="j+'a'" :class="trip.schdraft_template_id == template_id ? 'highlight' : null">
                                    <div>
                                        <span v-if="isThruIn(trip, 0)">⯅</span>
                                    </div>
                                </td>
                                <td :key="j+'b'" :class="trip.schdraft_template_id == template_id ? 'highlight' : null"></td>
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
                                <div v-if="showArrival(i)">着</div>
                                <div v-if="showDeparture(i)"><strong>發</strong></div>
                            </td>
                            <!-- For Each Trip -->
                            <template v-for="(trip, j) in data.schedule">
                                <td :key="j+'a'" :class="trip.schdraft_template_id == template_id ? 'highlight' : null">
                                    <!-- Not Null (i.e. has data) -->
                                    <template v-if="item = trip.schedule_line[i]">
                                        <!-- Arrival Time -->
                                        <div v-if="showArrival(i)">
                                            <span class="passing" v-if="item.is_pass">
                                                {{showPassing(item.time1)}}
                                            </span>
                                            <span v-else-if="!item.time1">
                                                <template v-if="isThruIn(trip, i)">⯅</template>
                                                <template v-else>&nbsp;</template>
                                            </span>
                                            <span v-else>
                                                {{displayTime(item.time1, !showSeconds)}}
                                            </span>
                                        </div>
                                        <!-- Departure Time -->
                                        <div v-if="showDeparture(i)">
                                            <span class="passing" v-if="item.is_pass">
                                                {{showPassing(item.time2)}}
                                            </span>
                                            <span v-else-if="!item.time2">
                                                <template v-if="showArrival(i)">
                                                    <template v-if="isThruOut(trip, i)">⯆</template>
                                                    <template v-else>&nbsp;</template>
                                                </template>
                                                <template v-else>
                                                    <template v-if="item.time1">
                                                        {{displayTime(item.time1, !showSeconds)}}
                                                    </template>
                                                    <template v-else>&nbsp;</template>
                                                </template>
                                            </span>
                                            <span v-else>
                                                <strong>{{displayTime(item.time2, !showSeconds)}}</strong>
                                            </span>
                                        </div>
                                        <!-- -------------- -->
                                    </template>
                                    <!-- Null & Within Index Range -->
                                    <div class="passing" v-else-if="i >= trip.begin_index && i <= trip.terminate_index">
                                        <span v-if="item.is_express_track">EXP</span>↓
                                    </div>
                                    <!-- Null & Outside Index Range -->
                                    <div v-else>
                                        <span v-if="!showArrival(i+1) && isThruIn(trip, i+1)">⯅</span>
                                        <span v-if="!showArrival(i-1) && isThruOut(trip, i-1)">⯆</span>
                                    </div>
                                </td>
                                <td :key="j+'b'" class="track_no"
                                :class="trip.schdraft_template_id == template_id ? 'highlight' : null">
                                    <!-- Track No. -->
                                    <template v-if="item = trip.schedule_line[i]">
                                        <div>{{item.track}}</div>
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
                                <td :key="j+'a'" :class="trip.schdraft_template_id == template_id ? 'highlight' : null">
                                    <div>
                                        <span v-if="isThruOut(trip, trip.schedule_line.length - 1)">⯆</span>
                                    </div>
                                </td>
                                <td :key="j+'b'" :class="trip.schdraft_template_id == template_id ? 'highlight' : null"></td>
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
.passing{
    color: #999;
    font-size: 0.6rem;
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