<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const sd = require('~/schdraft.js');

import { BIcon, BIconPencil, BIconPlus } from 'bootstrap-vue'

export default {

    components: {
        BIcon, BIconPencil, BIconPlus,
    },
    
    props: {
        value: null,
    },

    data() {
        return {
            value$: null,
            select_line_options: [],
            select_line_id: null,
            station_list: [],
            select_station1: null,
            select_station2: null,
            isBelow: null,
        };
    },

    watch: {
        value(){
            this.value$ = this.value;
        }
    },

    async mounted(){
        this.value$ = this.value;
    },

    methods: {
        async updateStations(){
            this.station_list = [];
            if (!this.select_line_id) return false;
            var response = await $.callAPI(axios, "GET", "items/lines_stations", {
                filter: { line_id: this.select_line_id },
                sort: 'sort',
                fields: 'station_id.id,station_id.name_chi',
            });
            if (response.http_status == 200){
                this.station_list = [];
                for (var i in response.data){
                    this.station_list.push({
                        id: response.data[i]?.station_id?.id, name_chi: response.data[i]?.station_id?.name_chi,
                    });
                }
            }
        },

        async openModalFirst(){
            this.select_line_id = null;
            this.select_station1 = null;
            this.select_station2 = null;
            this.$refs.modal_first.show();
        },

        async openModalAppend(isBelow){
            this.select_line_id = null;
            this.select_station1 = null;
            this.select_station2 = null;
            this.isBelow = isBelow;
            //Find Relevant Lines
            this.station_list = [];
            var station_id = ( isBelow ? this.value$[this.value$.length-1] : this.value$[0] )?.station_id;
            var response = await $.callAPI(axios, "GET", "items/lines_stations", {
                filter: { station_id: station_id },
                fields: 'line_id.id,line_id.name_chi',
            });
            if (response.http_status == 200){
                this.select_line_options = [{value: null, text: '--請選擇--'}];
                for (var i in response.data){
                    if (!response.data[i]?.line_id) continue;
                    this.select_line_options.push({
                         value: response.data[i]?.line_id?.id, text: response.data[i]?.line_id?.name_chi,
                    });
                }
            }
            //Show
            this.$refs.modal_append.show();
        },

        submitModalFirst(){
            var step = (this.select_station1 < this.select_station2) ? +1 : -1;
            var is_upbound = (this.select_station1 < this.select_station2) ? false : true;
            //First Station
            var i = this.select_station1;
            this.value$ = [{
                line_id: null, station_id: this.station_list[i].id,
                track: null, track_mod: {},
                is_upbound: null, is_express_tracks: false,
                depart_time: null, depart_time_mod: {},
                arrive_time: null, arrive_time_mod: {},
                pass_time: null, pass_time_mod: {},
                is_express_track: false,
            }];
            //Intermediate Stations
            var a = parseInt(this.select_station1);
            var b = parseInt(this.select_station2);
            for (var i = a + step; i != b; i += step){
                this.value$.push({
                    line_id: this.select_line_id, station_id: this.station_list[i].id,
                    track: null, track_mod: {},
                    is_upbound: is_upbound, is_express_tracks: false,
                    depart_time: null, depart_time_mod: {},
                    arrive_time: null, arrive_time_mod: {},
                    pass_time: null, pass_time_mod: {},
                    is_express_track: false,
                });
            }
            //Last Station
            var i = this.select_station2;
            this.value$.push({
                line_id: this.select_line_id, station_id: this.station_list[i].id,
                track: null, track_mod: {},
                is_upbound: is_upbound, is_express_tracks: false,
                depart_time: null, depart_time_mod: {},
                arrive_time: null, arrive_time_mod: {},
                pass_time: null, pass_time_mod: {},
                is_express_track: false,
            });
            //Emit
            this.$emit('input', this.value$);
            this.$refs.modal_first.hide();
        },

        submitModalAppend(){
            var station_id = ( this.isBelow ? this.value$[this.value$.length-1] : this.value$[0] )?.station_id;
            for (var n in this.station_list){
                if (this.station_list[n].id == station_id){
                    break;
                }
            }
            var a = parseInt(n);
            var b = parseInt(this.select_station1);
            var step = (a < b) ? +1 : -1;
            b += step;
            var is_upbound = (a < b) ? !this.isBelow : this.isBelow;
            //Insert Stations
            if (this.isBelow){
                for (var i = a + step; i != b; i += step){
                    this.value$.push({
                        line_id: this.select_line_id, station_id: this.station_list[i]?.id,
                        track: null, track_mod: {}, is_upbound: is_upbound,
                        depart_time: null, depart_time_mod: {},
                        arrive_time: null, arrive_time_mod: {},
                        pass_time: null, pass_time_mod: {},
                    });
                }
            }else{
                this.value$[0].line_id = this.select_line_id;
                this.value$[0].is_upbound = is_upbound;
                for (var i = a + step; i != b; i += step){
                    this.value$.unshift({
                        line_id: this.select_line_id, station_id: this.station_list[i]?.id,
                        track: null, track_mod: {}, is_upbound: is_upbound,
                        depart_time: null, depart_time_mod: {},
                        arrive_time: null, arrive_time_mod: {},
                        pass_time: null, pass_time_mod: {},
                    });
                }
                this.value$[0].line_id = null;
                this.value$[0].is_upbound = null;
            }
            //Emit
            this.$emit('input', this.value$);
            this.$refs.modal_append.hide();
        },

    },

    computed:{
        station_options(){
            var arr = [{value: null, text: '--請選擇--'}];
            for (var i in this.station_list){
                arr.push({value: i, text: `#${parseInt(i)+1}: ${this.station_list[i].name_chi}`});
            }
            return arr;
        },
    },

}

</script>

<template>
    <div>

        <!-- Add New Above -->
        <div class="text-center">
            <b-button class="py-0 my-2" variant="outline-success" v-if="(this.value||[]).length" @click="openModalAppend(false)">
                <b-icon-plus></b-icon-plus> 新增車站
            </b-button>
        </div>

        <!-- Display of Content (Only if not empty) -->
        <slot v-if="(this.value||[]).length"></slot>

        <!-- Add First Section -->
        <div class="text-center">
            <b-button class="py-0 my-2" variant="outline-success" v-if="!(this.value||[]).length" @click="openModalFirst()">
                <b-icon-plus></b-icon-plus> 新增車站
            </b-button>
        </div>

        <!-- Add New Below -->
        <div class="text-center">
            <b-button class="py-0 my-2" variant="outline-success" v-if="(this.value||[]).length" @click="openModalAppend(true)">
                <b-icon-plus></b-icon-plus> 新增車站
            </b-button>
        </div>

        <!-- Modal (First Section) -->
        <b-modal ref="modal_first" hide-header hide-footer centered>

            <div class="mb-1"><strong>路線：</strong></div>

            <select-generic type="line_types" sort="sort"
            sub-type="lines" sub-sort="operator_id, name_eng" foreign-id="line_type_id"
            operator-attr = "operator_id" v-model="select_line_id"
            variant="outline-info" @input="updateStations()">
                <b-icon-pencil />
            </select-generic>

            <div class="my-1"><strong>由：</strong></div>
            <b-form-select v-model="select_station1" :options="station_options">

            </b-form-select>

            <div class="my-1"><strong>往：</strong></div>
            <b-form-select v-model="select_station2" :options="station_options">

            </b-form-select>

            <b-button variant="primary" class="mt-2" @click="submitModalFirst()" block
            :disabled="!select_line_id || !select_station1 || !select_station2 || select_station1 == select_station2">
                提交
            </b-button>

        </b-modal>

        <!-- Modal (Append Station) -->
        <b-modal ref="modal_append" hide-header hide-footer centered>

            <div class="mb-1"><strong>路線：</strong></div>
            <b-form-select v-model="select_line_id" :options="select_line_options" @input="updateStations()">
            </b-form-select>

            <div class="my-1"><strong v-if="isBelow">往：</strong><strong v-else>由：</strong></div>
            <b-form-select v-model="select_station1" :options="station_options"></b-form-select>

            <b-button variant="primary" class="mt-2" @click="submitModalAppend()" block
            :disabled="!select_line_id || !select_station1">
                提交
            </b-button>

        </b-modal>

    </div>
</template>