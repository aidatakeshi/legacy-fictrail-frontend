<script> 

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const sd = require('~/schdraft.js');

import { BIcon, BIconPencil, BIconPlus, BIconX, BIconInfoCircleFill } from 'bootstrap-vue'
import ShowItemAttr from '../show-item-attr.vue';
import InputTime from './input-time.vue';

export default {

    components: {
        BIcon, BIconPencil, BIconPlus, BIconX, BIconInfoCircleFill,
        ShowItemAttr, InputTime,
    },
    
    props: {
        value: Object,
        prev: Object,
        next: Object,
        trigger: null,
        line: Object,
        station: Object,
        section: Object,
        vehiclePerformance: Object,
        distance: String,
        mileage: String,
        isUpbound: Boolean,
        hideArrive: Boolean,
        hideDepart: Boolean,
        isFirst: Boolean,
        isLast: Boolean,
    },

    data() {
        return {
            data: {},
            new_mod_value: {
                track_mod: null,
                arrive_time_mod: null,
                depart_time_mod: null,
                pass_time_mod: null,
            },
        };
    },

    watch: {
        trigger(){
            this.data = this.value;
            this.$forceUpdate();
        },
        value(){
            this.data = this.value;
        },
    },

    async mounted(){
        this.data = this.value;
    },

    methods: {
        displayTime: sd.displayTime,
        displayTimeInterval: sd.displayTimeInterval,
        displayTimeIntervalAlt: sd.displayTimeIntervalAlt,

        //
        update(){
            //When arrive is not set but depart is set, consider it as pass
            if (!this.data.arrive_time && this.data.depart_time && !this.isFirst){
                this.data.pass_time = this.data.depart_time;
                this.data.depart_time = null;
            }
            //Emit
            this.$emit('input', this.data);
            this.$emit('update');
            this.$forceUpdate();
        },

        //Mod
        newMod(attr){
            if (this.new_mod_value[attr] === null) return false;
            var id = prompt('請輸入mod ID');
            if (!id) return null;
            this.data[attr][id] = this.new_mod_value[attr];
            this.new_mod_value[attr] = null;
            this.update();
        },
        removeMod(attr, id){
            if (!this.data?.[attr]?.[id]) return false;
            delete this.data[attr][id];
            this.update();
        },

        //Arrive / Depart / Pass
        toggleToPass(){
            var a = this.data.arrive_time || this.data.depart_time;
            var b = this.data.depart_time || this.data.arrive_time;
            this.data.pass_time = Math.round((a + b) / 2 / 5) * 5;
            this.data.arrive_time = null;
            this.data.depart_time = null;
        },
        toggleToArriveDepart(){
            this.data.arrive_time = this.data.pass_time;
            this.data.depart_time = this.data.pass_time;
            this.data.pass_time = null;
        },
    },

    computed:{
        speed_limit(){
            return Math.min(
                (this.vehiclePerformance?.max_speed_kph || Infinity) * 1,
                (this.line?.max_speed_kph || Infinity) * 1,
                (this.section?.max_speed_kph || Infinity) * 1,
            );
        },
        min_travel_time_s(){
            return sd.minTravelTime(
                this.line,
                this.section,
                this.vehiclePerformance,
                this.isUpbound,
                this.data.is_express_track,
                this.isPassPrev, this.isPassNext,
            ) || 0;
        },
        min_travel_time(){
            if (!this.min_travel_time_s) return 'N/A';
            if (!isFinite(this.min_travel_time_s)) return 'N/A';
            return sd.displayTimeInterval(this.min_travel_time_s);
        },
        specified_travel_time(){
            var a = (this.data.arrive_time || this.data.pass_time);
            var b = ((this.prev||{}).depart_time || (this.prev||{}).pass_time);
            if (!a || !b) return null;
            return (a - b);
        },
        isPassPrev(){
            return this.prev?.pass_time ? true : false;
        },
        isPassNext(){
            return this.data?.pass_time ? true : false;
        },
    },

}

</script>

<template>
    <tr>
        <!-- Station Name -->
        <td class="left-header">
            <strong>{{station.name_chi}}</strong>
        </td>
        <!-- Arrive / Depart -->
        <td class="left-header no-padding">
            <template v-if="isLast">
                <b-button variant="link" size="sm" tabindex="1" class="text-dark">着</b-button>
            </template>
            <template v-else-if="isFirst">
                <b-button variant="link" size="sm" tabindex="1" class="text-dark">
                    <strong>發</strong>
                </b-button>
            </template>
            <b-button variant="link" size="sm" tabindex="1" class="text-dark"
            v-else-if="!data.pass_time" @click="toggleToPass">
                <div v-if="!hideArrive">着</div>
                <div v-if="!hideDepart"><strong>發</strong></div>
            </b-button>
            <b-button variant="link" size="sm" tabindex="1" class="text-dark"
            v-else @click="toggleToArriveDepart">
                <div v-if="!hideArrive">&nbsp;</div>
                <div v-if="!hideDepart"><strong>通</strong></div>
            </b-button>
        </td>
        <!-- Time Input -->
        <td class="no-padding">
            <template v-if="!data.pass_time">
                <div v-if="!hideArrive">
                    <input-time v-model="data.arrive_time" tabindex="2" @change="update"
                        :prev-value="(prev||{}).depart_time || (prev||{}).pass_time"
                        :next-value="data.depart_time"
                    />
                </div>
                <div v-if="!hideDepart">
                    <input-time v-model="data.depart_time" depart tabindex="2" @change="update"
                        :prev-value="data.arrive_time || (prev||{}).depart_time || (prev||{}).pass_time"
                        :next-value="(next||{}).arrive_time || (next||{}).pass_time"
                    />
                </div>
            </template>
            <template v-else>
                <div v-if="!hideArrive">↓</div>
                <div v-if="!hideDepart">
                    <input-time v-model="data.pass_time" pass tabindex="2" @change="update"
                        :prev-value="(prev||{}).depart_time || (prev||{}).pass_time"
                        :next-value="(next||{}).arrive_time || (next||{}).pass_time"
                    />
                </div>
            </template>
        </td>
        <!-- Time Interval -->
        <td class="text-secondary" style="font-size: 0.75rem;">
            <template v-if="!data.pass_time">
                <div v-if="!hideArrive"
                :class="(specified_travel_time < min_travel_time_s) ? 'warning' : null">
                    {{displayTimeIntervalAlt(specified_travel_time)}}
                </div>
                <div v-if="!hideDepart">
                    <strong>{{displayTimeIntervalAlt(data.depart_time, data.arrive_time)}}</strong>
                </div>
            </template>
            <template v-else>
                <div v-if="!hideArrive">↓</div>
                <div v-if="!hideDepart"
                :class="(specified_travel_time < min_travel_time_s) ? 'warning' : null">
                    {{displayTimeIntervalAlt(specified_travel_time)}}
                </div>
            </template>
        </td>
        <!-- Track Number & Express Track -->
        <td>
            <b-button variant="outline-dark" size="sm" @click="$refs.track_modal.show()" tabindex="3">
                {{data.track || '??'}}<small>號</small>
            </b-button>
            <template v-if="!hideArrive && section.no_tracks > 2">
                <b-button variant="outline-secondary" size="sm" tabindex="4"
                v-if="!data.is_express_track" @click="data.is_express_track = true; update();">慢線</b-button>
                <b-button variant="primary" size="sm" tabindex="4"
                v-else @click="data.is_express_track = false; update();">快線</b-button>
            </template>
        </td>
        <!-- Mods -->
        <td class="text-left" style="line-height: 0.75rem; font-size: 0.5rem;">
            <div class="d-flex align-items-center">
                <div class="mr-auto">
                    <div v-if="Object.keys(data.track_mod||{}).length">
                        <strong>月台/軌道：</strong>
                        <div v-for="(value, id) in data.track_mod" :key="id">
                            - <strong>{{id}}:</strong> {{value}}<small>號</small>
                        </div>
                    </div>
                    <div v-if="Object.keys(data.arrive_time_mod||{}).length && !hideArrive">
                        <strong>到着時間：</strong>
                        <div v-for="(value, id) in data.arrive_time_mod" :key="id">
                            - <strong>{{id}}:</strong> {{displayTime(value) || '不設定'}}
                        </div>
                    </div>
                    <div v-if="Object.keys(data.pass_time_mod||{}).length && !hideArrive">
                        <strong>通過時間：</strong>
                        <div v-for="(value, id) in data.pass_time_mod" :key="id">
                            - <strong>{{id}}:</strong> {{displayTime(value) || '不設定'}}
                        </div>
                    </div>
                    <div v-if="Object.keys(data.depart_time_mod||{}).length && !hideDepart">
                        <strong>發車時間：</strong>
                        <div v-for="(value, id) in data.depart_time_mod" :key="id">
                            - <strong>{{id}}:</strong> {{displayTime(value) || '不設定'}}
                        </div>
                    </div>
                </div>
                <b-button variant="link" size="sm" @click="$refs.mods_modal.show()" tabindex="5">
                    <b-icon-pencil />
                </b-button>
            </div>
        </td>
        <!-- Distance -->
        <td>{{distance || '-'}}</td>
        <!-- Mileage -->
        <td>{{mileage || '-'}}</td>
        <!-- Restrictions -->
        <td class="remarks-small"><!--
        ---><template v-if="!hideArrive"><!---
            --->速限{{speed_limit}}km/h / 最短{{min_travel_time}} ({{isPassPrev?'通':'停'}}{{isPassNext?'通':'停'}})<!---
        ---></template><!---
        ---><template v-if="section.remarks">
                {{section.remarks}}<!---
        ---></template><!---
    ---></td>
        <!-- Button -->
        <td>
            TBD
        </td>

        <!---------------------------------------------------------------------------------------->

        <!-- Select Track Modal (without mod) -->
        <b-modal ref="track_modal" title="停靠月台" hide-footer centered>
            <!-- Button -->
            <div>
                <b-button v-for="n in station.tracks" :key="n"
                style="min-width: 2.5rem;" class="mr-1 mb-1"
                variant="outline-primary" @click="data.track = n; $refs.track_modal.hide(); update();"
                >{{n}}</b-button><!---
            ---><b-button style="min-width: 2.5rem;" class="mr-1 mb-1"
                variant="outline-dark" @click="data.track = null; $refs.track_modal.hide(); update();"
                >??</b-button>
            </div>
            <!-- Station Remarks -->
            <template v-if="station.remarks">
                <hr class="my-1" />
                <strong>車站備註：</strong>
                <div>
                    <pre style="white-space: pre-wrap;">{{station.remarks}}</pre>
                </div>
            </template>
        </b-modal>

        <!-- Edit Mods Modal -->
        <b-modal ref="mods_modal" title="編輯Mods" hide-footer centered scrollable>

            <b-card class="my-1" body-class="p-2" v-if="!isFirst">
                <h4>到着時間</h4>
                <div class="row">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <strong>#default</strong>
                    </div>
                    <div class="col-sm-6">
                        <input-time v-model="data.arrive_time" original-class small @change="update"
                        placeholder="(不適用)" />
                    </div>
                </div>
                <div class="row" v-for="(value, key) in data.arrive_time_mod" :key="key">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <b-button variant="link" class="p-0" @click="removeMod('arrive_time_mod', key)">
                            <b-icon-x class="text-danger" />
                        </b-button>
                        {{key}}
                    </div>
                    <div class="col-sm-6">
                        <input-time v-model="data.arrive_time_mod[key]" :prevValue="data.arrive_time"
                        original-class small @change="update" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <b-button variant="link" class="p-0" @click="newMod('arrive_time_mod')">
                            <b-icon-plus class="text-success" />
                        </b-button>
                    </div>
                    <div class="col-sm-6">
                        <input-time v-model="new_mod_value.arrive_time_mod" :prevValue="data.arrive_time"
                        original-class small />
                    </div>
                </div>
            </b-card>

            <b-card class="my-1" body-class="p-2" v-if="!isFirst && !isLast">
                <h4>通過時間</h4>
                <div class="row">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <strong>#default</strong>
                    </div>
                    <div class="col-sm-6">
                        <input-time v-model="data.pass_time" original-class small @change="update"
                        placeholder="(不適用)" />
                    </div>
                </div>
                <div class="row" v-for="(value, key) in data.pass_time_mod" :key="key">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <b-button variant="link" class="p-0" @click="removeMod('pass_time_mod', key)">
                            <b-icon-x class="text-danger" />
                        </b-button>
                        {{key}}
                    </div>
                    <div class="col-sm-6">
                        <input-time v-model="data.pass_time_mod[key]" :prevValue="data.pass_time"
                        original-class small @change="update" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <b-button variant="link" class="p-0" @click="newMod('pass_time_mod')">
                            <b-icon-plus class="text-success" />
                        </b-button>
                    </div>
                    <div class="col-sm-6">
                        <input-time v-model="new_mod_value.pass_time_mod" :prevValue="data.pass_time"
                        original-class small />
                    </div>
                </div>
            </b-card>

            <b-card class="my-1" body-class="p-2" v-if="!isLast">
                <h4>開出時間</h4>
                <div class="row">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <strong>#default</strong>
                    </div>
                    <div class="col-sm-6">
                        <input-time v-model="data.depart_time" original-class small @change="update"
                        placeholder="(不適用)" />
                    </div>
                </div>
                <div class="row" v-for="(value, key) in data.depart_time_mod" :key="key">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <b-button variant="link" class="p-0" @click="removeMod('depart_time_mod', key)">
                            <b-icon-x class="text-danger" />
                        </b-button>
                        {{key}}
                    </div>
                    <div class="col-sm-6">
                        <input-time v-model="data.depart_time_mod[key]" :prevValue="data.depart_time"
                        original-class small @change="update" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <b-button variant="link" class="p-0" @click="newMod('depart_time_mod')">
                            <b-icon-plus class="text-success" />
                        </b-button>
                    </div>
                    <div class="col-sm-6">
                        <input-time v-model="new_mod_value.depart_time_mod" :prevValue="data.depart_time"
                        original-class small />
                    </div>
                </div>
            </b-card>

            <b-card class="my-1" body-class="p-2">
                <h4>月台/軌道</h4>
                <div class="row">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <strong>#default</strong>
                    </div>
                    <div class="col-sm-6">
                        <input class="form-control form-control-sm" v-model="data.track" @change="update" />
                    </div>
                </div>
                <div class="row" v-for="(value, key) in data.track_mod" :key="key">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <b-button variant="link" class="p-0" @click="removeMod('track_mod', key)">
                            <b-icon-x class="text-danger" />
                        </b-button>
                        {{key}}
                    </div>
                    <div class="col-sm-6">
                        <input class="form-control form-control-sm" v-model="data.track_mod[key]" @change="update" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6" style="font-size: 90%;">
                        <b-button variant="link" class="p-0" @click="newMod('track_mod')">
                            <b-icon-plus class="text-success" />
                        </b-button>
                    </div>
                    <div class="col-sm-6">
                        <input class="form-control form-control-sm" v-model="new_mod_value.track_mod" @change="update" />
                    </div>
                </div>
            </b-card>

        </b-modal>

        <!---------------------------------------------------------------------------------------->
    </tr>
</template>