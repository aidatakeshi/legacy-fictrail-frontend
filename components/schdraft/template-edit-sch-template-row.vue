<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import {
    BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck, BIconChevronDown,
    BIconPencilSquare, BIconInfoSquare,
} from 'bootstrap-vue';
import TemplateEditSchTemplateMod from './template-edit-sch-template-mod.vue';

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck, BIconChevronDown,
    BIconPencilSquare, BIconInfoSquare,
        TemplateEditSchTemplateMod,
    },
    props: {
        value: Object,
        info: Object,
        index: Number,
        isFirst: Boolean,
        isSecond: Boolean,
        isLast: Boolean,
        prevValue: Number,
        nextValue: Number,
        prevItem: Object,
    },
    data() {
        return {
            options_tracks: [],
            station_remarks: null,
        };
    },
    watch: {

    },
    mounted(){

    },
    methods:{
        changed(){
            this.$emit('input', this.value);
        },
        xor(a, b){
            return (a && !b) || (!a && b);
        },
        displayTimeIntervalMMSS: $.displayTimeIntervalMMSS,
        //Track Number Modal
        async showTrackNumberModal(){
            var $route = `items/station/${encodeURIComponent(this.value.station_id)}`;
            var response = await $.callAPI(axios, 'GET', $route);
            if (response.http_status != 200) return false;
            this.options_tracks = response.data?.tracks || [];
            this.station_remarks = response.data?.remarks;
            this.$refs.track_select_modal.show();
        },
        trackSelected(track){
            this.value.track = track;
            this.changed();
            this.$refs.track_select_modal.hide();
        },
    },
    computed: {
        time1Diff(){
            if (!this.prevValue) return null;
            return $.displayTimeIntervalAlt(this.value.time1 - this.prevValue);
        },
        time2Diff(){
            var prev = (this.value.time1 || this.prevValue);
            if (!prev) return null;
            return $.displayTimeIntervalAlt(this.value.time2 - prev);
        },
        travel_time(){
            return (this.info||{}).travel_time || {};
        },
        travel_time_min(){
            if (!this.prevItem) return null;
            if (!this.value.is_pass && !this.prevItem.is_pass) return this.travel_time.time_stop_stop;
            if (this.value.is_pass && this.prevItem.is_pass) return this.travel_time.time_pass_pass;
            return this.travel_time.time_stop_pass;
        },
        travel_time_inputted(){
            if (!this.prevValue) return null;
            var value = (this.value.time1 || this.value.time2) - this.prevValue;
            if (value > 0) return value;
            return null;
        }
    },
}
</script>

<template>
    <tr>

        <!-- Buttons -->
        <td>
            <b-button variant="link" class="p-0 text-secondary" size="sm" @click="$emit('show-menu', index)">
                <b-icon-chevron-down />
            </b-button>
        </td>

        <!-- Station Name -->
        <td class="name" style="white-space: normal;">
            <strong><name-station :id="value.station_id" /></strong>
            <b-button variant="link" class="p-0 text-primary" size="sm" @click="$emit('edit-station', value.station_id)">
                <b-icon-pencil-square />
            </b-button>
        </td>

        <!-- Distance -->
        <td v-if="isFirst">-</td>
        <td v-else>
            {{(info.distance_km||0).toFixed(1)}}
        </td>

        <!-- Mileage -->
        <td>
            {{(info.mileage_km||0).toFixed(1)}}
        </td>

        <!-- Stop / Pass Toggler -->
        <td v-if="isLast || isFirst">
            <b-button variant="dark" class="m-0" style="line-height: 1em;" tabindex="1">
                停<br/>車
            </b-button>
        </td>
        <td v-else-if="!value.is_pass">
            <b-button variant="dark" class="m-0" style="line-height: 1em;"
            @click="value.is_pass = true; changed();" tabindex="1">
                停<br/>車
            </b-button>
        </td>
        <td v-else>
            <b-button variant="outline-dark" class="m-0" style="line-height: 1em;"
            @click="value.is_pass = false; changed();" tabindex="1">
                通<br/>過
            </b-button>
        </td>

        <!-- Time -->
        <td>
            <input-time v-model="value.time1" v-if="!isFirst" tabindex="2"
                :italic="value.is_pass" size="sm" center small
                :suffix="(value.is_pass) ? '到' : '着'"
                :prev-value="prevValue" :next-value="value.time2 || nextValue"
                @input="changed();"
            />
            <input-time v-model="value.time2" v-if="!isLast" tabindex="2"
                :bold="!value.is_pass" :italic="value.is_pass" size="sm" center small
                :suffix="(value.is_pass) ? (value.time1 ? '開' : '通') : '發'"
                :prev-value="value.time1 || prevValue" :next-value="nextValue"
                @input="changed();"
            />
        </td>

        <!-- Time Differece -->
        <td class="text-secondary" style="font-size: 60%; line-height: 2.5em;">
            <template v-if="!isFirst">
                <span style="font-style: italic;" v-if="value.is_pass">{{time1Diff}}</span>
                <span v-else>{{time1Diff}}</span>
            </template>
            <br v-if="!isFirst && !isLast" />
            <template v-if="!isLast">
                <span style="font-style: italic;" v-if="value.is_pass">{{time2Diff}}</span>
                <span style="font-weight: bold;" v-else>{{time2Diff}}</span>
            </template>
        </td>

        <!-- Track -->
        <td>
            <b-button variant="outline-dark" size="sm" tabindex="3"
            style="min-width: 2em;" @click="showTrackNumberModal">
                {{value.track || '-'}}
            </b-button>
            <!-- Tracks Selecter Modal -->
            <b-modal ref="track_select_modal" title="月台/軌道" hide-footer scrollable centered>
                <div class="my-remarks mb-1" v-if="station_remarks">
                    <strong>車站備註：</strong><br/>
                    <span>{{station_remarks}}</span>
                </div>
                <div class="row">
                    <div class="col-3 col-sm-2" v-for="(track, i) in options_tracks" :key="i">
                        <b-button :variant="(track != value.track ? 'outline-' : '') + 'secondary'"
                        class="my-1 py-1" block @click="trackSelected(track)">
                            {{track}}
                        </b-button>
                    </div>
                </div>
            </b-modal>
        </td>

        <!-- Is Express Track -->
        <td v-if="isLast" />
        <td v-else>
            <b-button variant="outline-secondary" size="sm" tabindex="4" v-if="!value.is_express_track"
            class="my-1 text-danger" @click="value.is_express_track = true; changed();">
                <b-icon-x scale="1.5" />
            </b-button>
            <b-button variant="outline-secondary" size="sm" tabindex="4" v-else
            class="my-1 text-success" @click="value.is_express_track = false; changed();">
                <b-icon-check scale="1.5" />
            </b-button>
        </td>

        <!-- Mods -->
        <td class="mods">
            <template-edit-sch-template-mod v-model="value.mod" :default-value="value"
            :station-id="value.station_id" />
        </td>

        <!-- Remarks -->
        <td>
            <!-- Remarks for the line-station -->
            <template v-if="!isFirst">
                <div class="d-flex align-items-center">
                    <div class="mr-auto text-left" style="font-size: 0.6rem; white-space: normal;">
                        <div class="text-info">
                            最少: 
                            <span v-if="!value.is_pass && !prevItem.is_pass">
                                <strong>{{displayTimeIntervalMMSS(travel_time.time_stop_stop)}}</strong>
                                (v={{travel_time.max_speed_stop_stop}})
                            </span>
                            <span v-else>
                                {{displayTimeIntervalMMSS(travel_time.time_stop_stop)}}
                            </span>
                            /
                            <span v-if="xor(value.is_pass, prevItem.is_pass)">
                                <strong>{{displayTimeIntervalMMSS(travel_time.time_stop_pass)}}</strong>
                                (v={{travel_time.max_speed_stop_pass}})
                            </span>
                            <span v-else>
                                {{displayTimeIntervalMMSS(travel_time.time_stop_pass)}}
                            </span>
                            <template v-if="!isSecond && !isLast">
                                /
                                <span v-if="value.is_pass && prevItem.is_pass">
                                    <strong>{{displayTimeIntervalMMSS(travel_time.time_pass_pass)}}</strong>
                                    (v={{travel_time.max_speed_pass_pass}})
                                </span>
                                <span v-else>
                                    {{displayTimeIntervalMMSS(travel_time.time_pass_pass)}}
                                </span>
                            </template>
                        </div>
                        <div v-if="travel_time_inputted && travel_time_min">
                            <span class="text-danger" v-if="travel_time_inputted < travel_time_min">
                                <strong>行車時間不足</strong>
                            </span>
                            <span v-else>
                                餘裕時分: {{Math.round(travel_time_inputted - travel_time_min)}}s
                                ({{(travel_time_inputted / travel_time_min * 100 - 100).toFixed(2)}}%)
                            </span>
                        </div>
                    </div>
                    <div>
                        <b-button variant="link" class="text-info" size="sm" @click="$refs.remarks2_modal.show()">
                            <b-icon-info-square />
                        </b-button>
                        <b-modal ref="remarks2_modal" size="md" title="備註" hide-footer centered>
                            <b-card body-class="p-1" v-for="(item, i) in (info.line_stations || [])" :key="i">
                                <div>
                                    <strong>{{item.station1_name_chi}} → {{item.station2_name_chi}}</strong>
                                </div>
                                <div style="font-size: 80%;">
                                    距離: {{item.distance_km}} km / 最高速度:
                                    <span v-if="item.max_speed_kph">{{item.max_speed_kph}} km/h</span>
                                    <span v-else>[依照路線最高速度]</span>
                                </div>
                                <div>
                                    <template v-for="(v, k) in (item.additional_time || {})">
                                        <b-badge class="mr-1" :key="k" v-if="v">
                                            {{k}}: +{{v}}s
                                        </b-badge>
                                    </template>
                                </div>
                                <div class="my-remarks mt-1" v-if="item.remarks">
                                    <span>{{item.remarks}}</span>
                                </div>
                            </b-card>
                        </b-modal>
                    </div>
                </div>
                <hr class="my-0" />
            </template>
            <!-- Remarks for the template -->
            <div class="d-flex align-items-center">
                <div class="remarks mr-auto">{{value.remarks}}</div>
                <div>
                    <b-button variant="link" class="text-primary" size="sm" @click="$refs.remarks_modal.show()">
                        <b-icon-pencil-square />
                    </b-button>
                    <b-modal ref="remarks_modal" title="備註" hide-footer centered>
                        <b-form-textarea size="sm" rows="8" v-model="value.remarks" />
                    </b-modal>
                </div>
            </div>
            <!-------------------------------------------------------------->
        </td>

        <!------------------------------------------------------------------>
    </tr>
</template>