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
        async show(id, direction = 'up'){
            this.line_id = id;
            this.direction = direction;
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
            return this.data.stations[i].show_arrival;
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
    },
}
</script>

<template>
    <div>
        <!-- Main Modal -->
        <b-modal ref="_modal" centered scrollable hide-footer size="xl"
        header-bg-variant="dark" header-text-variant="light" :title="data_line.name_chi"
        @hide="$emit('hide')">

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

            <!-- Table -->
            <div class="table-responsive mt-4" v-if="data">
                <table class="table table-bordered my-table" style="font-size: 0.8rem;">
                    <!-- Header ------------------------------------------------------------>
                    <thead>
                        <tr class="thead-light">
                            <th class="sticky">種別/名稱</th>
                            <th />
                            <template v-for="(trip, i) in data.schedule">
                                <th colspan="2" :key="i" v-if="trip.train_name"
                                :style="{'background-color': trip.train_name.color, 'color': trip.train_name.color_text}">
                                    {{trip.train_name.name_chi}}
                                </th>
                                <th colspan="2" :key="i" v-else
                                :style="{'background-color': trip.train_type.color, 'color': trip.train_type.color_text}">
                                    {{trip.train_type.name_chi}}
                                </th>
                            </template>
                        </tr>
                        <tr class="thead-light">
                            <th class="sticky">服務編號</th>
                            <th />
                            <th colspan="2" v-for="(trip, i) in data.schedule" :key="i">
                                {{trip.train_number}}號
                            </th>
                        </tr>
                        <tr class="thead-light">
                            <th class="sticky">班次號碼</th>
                            <th />
                            <th colspan="2" v-for="(trip, i) in data.schedule" :key="i">
                                {{trip.trip_number}}
                            </th>
                        </tr>
                        <tr class="thead-light">
                            <th class="sticky">起點</th>
                            <th />
                            <th colspan="2" v-for="(trip, i) in data.schedule" :key="i">
                                {{trip.station_begin_name_chi.substring(0, 4)}}
                            </th>
                        </tr>
                        <tr class="thead-light">
                            <th class="sticky">終點</th>
                            <th />
                            <th colspan="2" v-for="(trip, i) in data.schedule" :key="i">
                                {{trip.station_terminate_name_chi.substring(0, 4)}}
                            </th>
                        </tr>
                    </thead>
                    <!-- Body -------------------------------------------------------------->
                    <tbody>
                        <tr v-for="(station, i) in data.stations" :key="i">
                            <!-- Station -->
                            <td class="header-col sticky text-left">
                                <strong>
                                    {{station.name_chi}}
                                    <small>({{station.mileage_km.toFixed(1)}})</small>
                                    <br/>
                                    <small>{{station.name_eng}}</small>
                                </strong>
                            </td>
                            <td class="header-col" style="width: 1rem;">
                                <div v-if="showArrival(i)">着</div>
                                <div v-if="showDeparture(i)"><strong>發</strong></div>
                            </td>
                            <!-- For Each Trip -->
                            <template v-for="(trip, j) in data.schedule">
                                <td :key="j+'a'">
                                    <template v-if="item = trip.schedule_line[i]">
                                        <!-- Arrival Time -->
                                        <div v-if="showArrival(i)">
                                            <template v-if="item.is_pass">
                                                <span style="color: #ccc; font-size: 0.6rem;">
                                                    {{showPassing(item.time1)}}
                                                </span>
                                            </template>
                                            <template v-else-if="!item.time1">&nbsp;</template>
                                            <template v-else>
                                                {{displayTime(item.time1, !showSeconds)}}
                                            </template>
                                        </div>
                                        <!-- Departure Time -->
                                        <div v-if="showDeparture(i)">
                                            <template v-if="item.is_pass">
                                                <span style="color: #ccc; font-size: 0.6rem;">
                                                    {{showPassing(item.time2)}}
                                                </span>
                                            </template>
                                            <template v-else-if="!item.time2 && item.time1">
                                                {{displayTime(item.time1, !showSeconds)}}
                                            </template>
                                            <template v-else-if="!item.time2">&nbsp;</template>
                                            <template v-else>
                                                <strong>{{displayTime(item.time2, !showSeconds)}}</strong>
                                            </template>
                                        </div>
                                        <!-- -------------- -->
                                    </template>
                                    <template v-else-if="i >= trip.begin_index && i <= trip.terminate_index">
                                        <div style="color: #ccc; font-size: 0.6rem;">↓</div>
                                    </template>
                                </td>
                                <td :key="j+'b'" style="color: #ccc; font-size: 0.6rem;">
                                    <!-- Track No. -->
                                    <template v-if="item = trip.schedule_line[i]">
                                        <div>{{item.track}}</div>
                                        <div v-if="item.is_express_track">EXP</div>
                                    </template>
                                </td>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>

        </b-modal>
    </div>
</template>