<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPen, BIconX } from 'bootstrap-vue'
import ColorBox from '../color-box.vue';

export default {
    components:{
        ColorBox
    },
    props: {
        templateId: String,
    },
    data() {
        return {
            data: {},
            showSeconds: true,
        };
    },
    watch: {

    },
    async mounted(){
        var $route = `schdraft-output/template/${encodeURIComponent(this.templateId)}`;
        var response = await $.callAPI(axios, 'GET', $route);
        if (response.http_status != 200) return false;
        this.data = response.data;
        this.$forceUpdate();
    },
    methods:{
        displayTime: $.displayTime,
        displayTimeInterval: $.displayTimeInterval,
    },
    computed: {

    },
}
</script>

<template>
    <div>
        <div class="mb-2">
            <b-form-checkbox switch v-model="showSeconds">顯示起點／終點秒數</b-form-checkbox>
        </div>

        <b-card v-for="(trips, day_type) in data" :key="day_type" class="mb-2" body-class="p-2">
            <!-- Title -->
            <h3>
                <b-badge v-if="day_type == 'wk'" variant="success">平日</b-badge>
                <b-badge v-if="day_type == 'ph'" variant="danger">假日</b-badge>
            </h3>

            <!-- Content -->
            <div class="table-responsive mb-0">
                <table class="table table-bordered my-table">
                    <!-- Header ------------------------------------------------------------>
                    <thead>
                        <tr class="thead-light">
                            <th>種別/名稱/服務編號</th>
                            <th colspan="2">起點</th>
                            <th colspan="2">終點</th>
                            <th>基準時間</th>
                        </tr>
                    </thead>
                    <!-- Body -------------------------------------------------------------->
                    <tbody>
                        <tr v-for="(trip, i) in trips" :key="i">
                            <td>
                                <template v-if="trip.train_name">
                                    <color-box :color="trip.train_name.color" />
                                    {{trip.train_name.name_chi}}
                                </template>
                                <template v-else-if="trip.train_type">
                                    <color-box :color="trip.train_type.color" />
                                    {{trip.train_type.type_chi}}
                                </template>
                                <template v-if="trip.train_number">
                                    {{trip.train_number}}號
                                </template>
                            </td>
                            <td>
                                {{(trip.schedule[0].station_id||{}).name_chi}}
                            </td>
                            <td>
                                {{displayTime(trip.schedule[0].time2, showSeconds)}}
                            </td>
                            <td>
                                {{(trip.schedule[trip.schedule.length-1].station_id||{}).name_chi}}
                            </td>
                            <td>
                                {{displayTime(trip.schedule[trip.schedule.length-1].time1, showSeconds)}}
                            </td>
                            <td class="text-secondary">
                                {{displayTime(trip.pivot_time, true)}}
                                <small v-if="trip.pivot_shift">
                                    ({{displayTimeInterval(trip.pivot_shift, true)}})
                                </small>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-------------------------------------------------------------------->
        </b-card>
    </div>
</template>