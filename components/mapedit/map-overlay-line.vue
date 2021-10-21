<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const _ = require('~/mapedit.js');
const config = require('~/mapedit-config.js');
const calc = require('~/mapedit-calc.js');
const data_handling = require('~/mapedit-data-handling.js');

import {
    BIcon, BIconPlus, BIconPen, BIconEye, BIconEyeSlash, BIconLock, BIconUnlock, BIconBezier2, BIconBoundingBox,
    BIconChevronUp, BIconChevronDown, BIconChevronLeft, BIconChevronRight, BIconArrowDownUp,
} from 'bootstrap-vue'

export default {
    
    components: {
        BIcon, BIconPlus, BIconPen, BIconEye, BIconEyeSlash, BIconLock, BIconUnlock, BIconBezier2, BIconBoundingBox,
        BIconChevronUp, BIconChevronDown, BIconChevronLeft, BIconChevronRight, BIconArrowDownUp,
    },
    props: {
        value: Object,
        trigger: Number,
        dataStations: Object,
        dataOperators: Object,
        selectedStationIndex: Number,
        chooseStationMode: Boolean,
        chooseStationResult: String,
    },

    data() {
        return {
            value$: {},
            appendStationBefore: null,
        };
    },

    watch: {
        trigger(){
            this.value$ = this.value;
            this.$forceUpdate();
        },
        chooseStationResult(station_id){
            if (station_id){
                var line_id = this.value$.id;
                var sections = this.value$.stations;
                _.lineAppendSection(line_id, sections, station_id, this.appendStationBefore, this.dataStations);
                this.appendStationBefore = null;
            }
        },
    },

    mounted(){
        this.value$ = this.value;
        this.$forceUpdate();
    },

    methods: {
        //Display Min Radius
        displayMinRadiusOfSection(section){
            var radius = calc.getMinRadiusOfSection(section);
            if (!radius) return '直線';
            if (radius > 5000) return 'R5000+';
            return `R${radius.toFixed(0)}`;
        },

        //Display Mileage
        displayMileage(km, showUnit = true){
            if (isFinite(km) && km !== null){
                return parseFloat(km).toFixed(1) + (showUnit ? "km" : "");
            }
            return "-"
        },

        //Display Avg Gradient
        displayAverageGradient(station1, station2, distance){
            var height1 = this.dataStations[station1]?.height_m;
            var height2 = this.dataStations[station2]?.height_m;
            if (height1 === null || height1 === undefined) return '-';
            if (height2 === null || height2 === undefined) return '-';
            if (!distance) return '-';
            var permil = Math.abs(height1 - height2) / distance;
            return permil.toFixed(2)+'‰';
        },

        //Display Integer
        int(val){
            if (isFinite(val) && val !== null) return parseFloat(val).toFixed(0);
            return '';
        },

        //Enter Append Station Mode
        appendStationMode(isBefore){
            this.appendStationBefore = isBefore;
            this.$emit('choose-station');
        },

        //Reverse Line
        reverseLine(){
            data_handling.reverseLine(this.value$);
            _.updateMileage(this.value$.stations);
            this.$emit('input', this.value$);
            this.$forceUpdate();
        },

        //Update Bounding Box
        async updateBoundingBox(){
            await data_handling.updateLineBoundingBox(this.value$, axios);
            this.$emit('input', this.value$);
            this.$forceUpdate();
        },

        //Save Data
        async saveData(){
            await data_handling.saveLineSectionsData(this.value$, axios);
            this.$emit('input', this.value$);
            this.$forceUpdate();
        },
    },

    computed: {

    },
}

</script>

<template>
    <div>
        <div class="map-overlay" :hidden="chooseStationMode">
            <div class="mb-2">
                <b-button variant="secondary" @click="$emit('close', value$.id)">
                    <b-icon-chevron-left />取消選取
                </b-button>
            </div>

            <!-- Info -->
            <h1>{{value$.name_chi}}</h1>
            <div class="map-linede-info">{{value$.name_eng}}</div>
            <div class="map-linede-info" v-if="value$.name_eng_short">
                簡稱：{{value$.name_eng_short}}
            </div>
            <div class="map-linede-info">
                營運者：
                <color-box :color="(dataOperators[value$.operator_id]||{}).color" />
                {{(dataOperators[value$.operator_id]||{}).name_chi}}
            </div>
            <div class="map-linede-info">
                長度：{{value$.length_km}} km
            </div>
            <div class="map-linede-info">
                最高速度：{{value$.max_speed_kph}} km/h
            </div>
            <hr class="my-2" />

            <!-- Bounding Box -->
            <div class="map-linede-info">
                x_min: {{value$.x_min || 'null'}} | x_max: {{value$.x_max || 'null'}}<br/>
                y_min: {{value$.y_min || 'null'}} | y_max: {{value$.y_max || 'null'}}
            </div>
            <hr class="my-2" />

            <!-- Save Button -->
            <b-button-group class='w-100'>
                <b-button variant='outline-info' @click="updateBoundingBox()">
                    <b-icon-bounding-box /> 更新邊界x,y
                </b-button>
                <b-button variant='outline-primary' @click="saveData()">
                    <b-icon-bezier2 /> 儲存車站/線段
                </b-button>
            </b-button-group>
            <hr class="my-2" />

            <!-- Sections (Stations) -->
            <div class="mb-2 d-flex align-items-center">
                <h2 class="mr-auto">車站及區間</h2>
                <b-button variant='outline-secondary' @click="$refs.line_modal.show(value$.id)">
                    <b-icon-pen />
                </b-button>
            </div>

            <!-- Append Section Before -->
            <div class="text-center">
                <b-button variant='secondary' @click="reverseLine()">
                    <b-icon-arrow-down-up /> 反轉上下行
                </b-button>
                <b-button variant="success" @click="appendStationMode(true)">
                    <b-icon-plus /> 新增車站
                </b-button>
            </div>

            <!-- Existing Sections -->
            <!-- Attributes to Concern while saving:
                unsaved_segments, unsaved_mileage, to_remove,
            -->
            <div class="map-linede-section" v-for="(section, i) in value$.stations" :key="i">
                <!-- Segments -->
                <div class="text-secondary text-center my-n1" style="font-size: 90%" v-if="section.segments.length">
                    {{section.segments.length - 1}}線段<!---
                    ---> | {{displayMinRadiusOfSection(section)}}<!---
                    ---> | {{displayAverageGradient(section.station_id, value$.stations[i-1].station_id, section.distance_km)}}
                </div>
                <!-- Station -->
                <div class="station" :class="{
                    'selected': selectedStationIndex == i,
                    'unsaved': section.unsaved_segments,
                    'to-remove': section.to_remove,
                    'new': !section.id && !section.to_remove,
                }">
                    <div class="main">
                        <div class="text flex-grow-1">
                            <span>#{{i}}: </span>
                            <span :class="{'text-danger': section.unsaved_station && !section.to_remove}">
                                {{(dataStations[section.station_id]||{}).name_chi || "(未知車站)"}}
                            </span>
                            <small :class="{'text-danger': section.unsaved_mileage}" v-if="!section.to_remove">
                                ({{displayMileage(section.distance_km, false)}}<!---
                            ---> | {{displayMileage(section.mileage_km)}}<!---
                            ---><template v-if="(dataStations[section.station_id]||{}).height_m"><!---
                                ---> | ▲{{(dataStations[section.station_id]||{}).height_m}}m<!---
                            ---></template><!---
                            --->)
                            </small>
                        </div>
                        <div class="buttons">
                        </div>
                    </div>
                </div>
                <!------------->
            </div>

            <!-- Append Section After -->
            <div class="text-center" v-if="(value$.stations||[]).length > 0">
                <b-button variant="success" @click="appendStationMode(false)">
                    <b-icon-plus /> 新增車站
                </b-button>
            </div>

            <!-- Save Button -->
            <hr class="my-2" />
            <b-button-group class='w-100'>
                <b-button variant='outline-info' @click="updateBoundingBox()">
                    <b-icon-bounding-box /> 更新邊界x,y
                </b-button>
                <b-button variant='outline-primary' @click="saveData()">
                    <b-icon-bezier2 /> 儲存車站/線段
                </b-button>
            </b-button-group>

            
            <div class="my-2">
                <b-button variant="secondary" @click="$emit('close', value$.id)">
                    <b-icon-chevron-left />取消選取
                </b-button>
            </div>
            
            <!-- Modal for Viewing Line -->
            {{value$.id}}
            <edit-line-stations ref="line_modal" />
        </div>
        <!-- Choose Station Mode -->
        <div class="map-overlay" v-if="chooseStationMode">
            <h2 class="mt-1">請選擇車站</h2>
            <div class="mt-2">
                <b-button variant="outline-secondary" @click="$emit('abort-choose-station')">
                    <b-icon-chevron-left />取消選擇
                </b-button>
            </div>
        </div>
    </div>
</template>