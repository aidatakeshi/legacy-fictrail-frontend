<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    const config = require('~/schdiagram-config.js');
    const _ = require('~/schdiagram.js');

    import {
        BIcon, BIconX, BIconGear, BIconBookshelf, BIconClock, BIconZoomIn, BIconZoomOut, BIconEyeglasses,
    } from 'bootstrap-vue'
    import SchDiagramGrid from './sch-diagram-grid.vue';
    import SchDiagramHeaderFrame from './sch-diagram-header-frame.vue';
    import SchDiagramLabelStations from './sch-diagram-label-stations.vue';

    export default {
        components: {
            BIcon, BIconX, BIconGear, BIconBookshelf, BIconClock, BIconZoomIn, BIconZoomOut, BIconEyeglasses,
            SchDiagramHeaderFrame, SchDiagramGrid, SchDiagramLabelStations,
        },
        
        head(){
            return {
                link: [

                ],
            };
        },

        data() {
            return {
                config: config,
                showing: false,
                //Data Related
                line_id: null,
                data_line: {},
                data_stations: [],
                data: {
                    up: { wk: [], ph: [] },
                    dn: { wk: [], ph: [] },
                },
                //Display Settings
                daytype: 'wk', //Day Type: 'wk'/'ph'
                direction: null, //Direction: 'up'/'dn'/null (both directions)
                express_track: null, //true (express track only) / false (local track only) / null (both)
                /**
                 * How to show opposite-direction lines (when direction != null):
                 * 0: Always hide
                 * 1: Show low-key on single-track; hide on multi-track
                 * 2: Show normally on single-track; hide on multi-track
                 * 3: Always show low-key
                 * 4: Show normally on single track; show low-key on multi-track
                 */
                showOppositeDirection: 1, //Show opposite-direction track low-key? (when direction != null)
                showAnotherTrack: true, //Show another track low-key? (when express_track != null)
                //Screen Size
                screenWidth: null,
                screenHeight: null,
                contentWidth: null,
                contentHeight: null,
                contentMidX: null,
                contentMidY: null,
                //Display-related Variables
                xpos: null,
                ypos: null,
                xscale: null,
                yscale: null,
                //Selection
                selectedTrip_direction: null,
                selectedTrip_daytype: null,
                selectedTrip_i: null,
                //Tooltip
                tooltip: null,
                tooltip_x: null,
                tooltip_y: null,
                //Others
                touchLastDist: null,
                isDragging: false,
            };
        },

        beforeDestroy(){

        },

        methods: {
            displayTime: $.displayTime,
            displayTimeInterval: $.displayTimeInterval,

            //Show Diagram
            async show(id, direction = 'dn', template_id = null){
                this.line_id = id;
                this.direction = direction;
                this.template_id = template_id;
                await this.loadData();
                this.showing = true;
                if (typeof window !== 'undefined'){
                    window.addEventListener('resize', this.handleScreenResized);
                }
                if (typeof document !== 'undefined'){
                    document.body.style.overflow = 'hidden';
                }
                this.handleScreenResized();
                this.resetView();
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
            },

            //Reset x/y pos/scale
            resetView(){
                [this.xpos, this.ypos, this.xscale, this.yscale] = [0.5, 0, config.xscale_default, 0];
                _.constraintTransformation(this);
            },

            //Load Data
            async loadData(){
                var $route = `schdraft-output/line/${encodeURIComponent(this.line_id)}`;
                var response = await $.callAPI(axios, "GET", $route, {});
                if (response.http_status != 200) return false;
                //Put to data variables
                this.data_line = response.data_line || {};
                this.data_stations = response.data?.dn?.wk?.stations || [];
                this.data = response.data;
            },

            //Line Display Mode (2: normal; 1: low-key: 0: none)
            getLineDisplayMode(direction, is_express_track, tracks){
                //Single Track
                if (tracks == 1){
                    if (this.direction === null || this.direction === direction) return 2;
                    if (this.showOppositeDirection == 4 || this.showOppositeDirection == 2) return 2;
                    if (this.showOppositeDirection == 1 || this.showOppositeDirection == 3) return 1;
                    return 0;
                }
                //Double Track (or Quadraple Track showing both)
                if (tracks == 2 || (tracks == 4 && this.express_track === null)){
                    if (this.direction === null || this.direction === direction) return 2;
                    if (this.showOppositeDirection == 3 || this.showOppositeDirection == 4) return 1;
                    return 0;
                }
                //Quadraple Track (showing only either exp / loc)
                if (tracks == 4){
                    var is_another_track = (this.express_track != is_express_track);
                    if (this.direction === null || this.direction === direction){
                        return (!is_another_track) ? 2 : (this.showAnotherTrack) ? 1 : 0;
                    }
                    if (this.showOppositeDirection == 3 || this.showOppositeDirection == 4){
                        return (!is_another_track) ? 1 : (this.showAnotherTrack) ? 1 : 0;
                    }
                    return 0;
                }
            },

            /**
             * Zoom In / Out Buttons
             */
            zoom(d, isIn){
                if (isIn){
                    this[d+'scale'] *= config.scale_step;
                }else{
                    this[d+'scale'] /= config.scale_step;
                }
                _.constraintTransformation(this);
            },

            /**
             * Handlers
             */
            handleScreenResized(){
                this.screenWidth = window.innerWidth;
                this.screenHeight = window.innerHeight;
                this.contentWidth = window.innerWidth - config.margin_left - config.margin_right;
                this.contentHeight = window.innerHeight - config.margin_top - config.margin_bottom;
                this.contentMidX = config.margin_left + this.contentWidth / 2;
                this.contentMidY = config.margin_top + this.contentHeight / 2;
                _.constraintTransformation(this);
            },
            handleWheelRoll(e){
                e.evt.preventDefault();
                var dy = (e.evt.deltaY > 1) ? 1 : -1;
                this.ypos += dy * config.scroll_step / this.yscale / this.basisHeight;
                _.constraintTransformation(this);
            },
            handleDragStart(event){
            },
            handleDragMove(event){
                var x = event.target.getAttr('x');
                var y = event.target.getAttr('y');
                //Calculate xpos, ypos
                this.xpos = (this.contentMidX - x) / this.basisWidth / this.xscale;
                this.ypos = (this.contentMidY - y) / this.basisHeight / this.yscale;
                _.constraintTransformation(this, event.target);
            },
            handleDragEnd(event){
                this.touchLastDist = 0;
            },

            /**
             * Misc
             */
            getKonvasConfig(draggable){
                return {
                    draggable: this.touchLastDist ? false : draggable,
                    scaleX: this.xscale,
                    scaleY: this.yscale,
                    x: this.contentMidX - this.xpos * this.basisWidth * this.xscale,
                    y: this.contentMidY - this.ypos * this.basisHeight * this.yscale,
                };
            },
            draw(){
                this.$forceUpdate();
            },

        },

        computed: {
            //Basis Width / Height
            basisWidth(){
                return 86400;
            },
            basisHeight(){
                return this.data_line?.length_km || 1;
            },
        },
    }

</script>

<template>
    <div class="overlay" v-if="showing">

        <!-- Canvas (Konva) -->
        <v-stage :config="{ width: screenWidth, height: screenHeight }" @wheel="handleWheelRoll">
            <v-layer>

                <!-- Grid -->
                <sch-diagram-grid :config="getKonvasConfig(true)"
                :data-stations="data_stations" :data-line="data_line"
                :xscale="xscale" :yscale="yscale" :xpos="xpos" :ypos="ypos"
                :contentWidth="contentWidth" :contentHeight="contentHeight"
                @dragstart="handleDragStart" @dragmove="handleDragMove" @dragend="handleDragEnd" />

                <!-- Frame (Fixed) -->
                <sch-diagram-header-frame :screenWidth="screenWidth" :screenHeight="screenHeight" />

                <!-- Label Stations (Fixed X, Moving Y) -->
                <sch-diagram-label-stations
                :data-stations="data_stations" :data-line="data_line"
                :yscale="yscale" :ypos="ypos"
                :contentHeight="contentHeight" :contentMidY="contentMidY" />

                <!-------------------------------------------------------------------->
            </v-layer>
        </v-stage>

        <!-- Zoom Buttons -->
        <div class="zoom-bar">
            <b-button variant="outline-dark" class="px-1 py-0" @click="resetView">
                <b-icon-eyeglasses />
            </b-button>
            <b-icon-clock scale="1.2" class="mx-2" />
            <b-button variant="outline-dark" class="px-1 py-0" @click="zoom('x', true)">
                <b-icon-zoom-in />
            </b-button>
            <b-button variant="outline-dark" class="px-1 py-0" @click="zoom('x', false)">
                <b-icon-zoom-out />
            </b-button>
            <b-icon-bookshelf scale="1.2" class="mx-2" />
            <b-button variant="outline-dark" class="px-1 py-0" @click="zoom('y', true)">
                <b-icon-zoom-in />
            </b-button>
            <b-button variant="outline-dark" class="px-1 py-0" @click="zoom('y', false)">
                <b-icon-zoom-out />
            </b-button>
            {{ {xscale} }}
        </div>

        <!-- Close Button -->
        <b-button variant="link" class="close-btn py-1 px-2" @click="hide()">
            <b-icon-x variant="dark" scale="1.4" />
        </b-button>

        <!-- Settings Bar -->
        <div class="settings-bar">
            <b-button class="px-2 py-0" :variant="direction ? 'secondary' : 'primary'"
            @click="direction = (direction == 'up') ? 'dn' : (direction == 'dn') ? null : 'up'">
                {{(direction == 'up') ? '上行' : (direction == 'dn') ? '下行' : '雙向'}}
            </b-button>
            <b-button class="px-2 py-0"
            :variant="(express_track === null) ? 'primary' : 'secondary'"
            @click="express_track = (express_track === true) ? false : (express_track === false) ? null : true">
                {{(express_track === true) ? '快線' : (express_track === false) ? '慢線' : '快慢'}}
            </b-button>
            <b-button class="px-2 py-0" :variant="daytype == 'ph' ? 'danger' : 'success'"
            @click="daytype = (daytype == 'ph') ? 'wk' : 'ph'">
                {{(daytype == 'ph') ? '假日' : '平日'}}
            </b-button>
            <b-button class="px-1 py-0" variant="secondary" @click="$refs.settings_modal.show()">
                <b-icon-gear />
            </b-button>
        </div>

        <!-- Settings Modal -->
        <b-modal ref="settings_modal" title="顯示設定"
        header-bg-variant="dark" header-text-variant="light" hide-footer centered>
            <div class="row">
                <div class="col-sm-4">
                    方向
                </div>
                <div class="col-sm-8">
                    <b-form-select v-model="direction" size="sm">
                        <b-form-select-option :value="null">雙向</b-form-select-option>
                        <b-form-select-option :value="'up'">上行</b-form-select-option>
                        <b-form-select-option :value="'dn'">下行</b-form-select-option>
                    </b-form-select>
                </div>
                <div class="col-sm-4">
                    反方向顯示方式
                </div>
                <div class="col-sm-8">
                    <b-form-select v-model="showOppositeDirection" size="sm" :disabled="direction === null">
                        <b-form-select-option :value="0">全部隱藏</b-form-select-option>
                        <b-form-select-option :value="1">在單線區間低調顯示；在複線區間隱藏</b-form-select-option>
                        <b-form-select-option :value="2">在單線區間正常顯示；在複線區間隱藏</b-form-select-option>
                        <b-form-select-option :value="3">全部低調顯示</b-form-select-option>
                        <b-form-select-option :value="4">在單線區間正常顯示；在複線區間低調顯示</b-form-select-option>
                    </b-form-select>
                </div>
                <div class="col-sm-4">
                    快慢線 <small>(在四線區間)</small>
                </div>
                <div class="col-sm-8">
                    <b-form-select v-model="express_track" size="sm">
                        <b-form-select-option :value="null">兩者皆顯示</b-form-select-option>
                        <b-form-select-option :value="true">快線</b-form-select-option>
                        <b-form-select-option :value="false">慢線</b-form-select-option>
                    </b-form-select>
                </div>
                <div class="col-sm-4">
                    另一線顯示方式
                </div>
                <div class="col-sm-8">
                    <b-form-select v-model="showAnotherTrack" size="sm" :disabled="express_track === null">
                        <b-form-select-option :value="false">隱藏</b-form-select-option>
                        <b-form-select-option :value="true">低調顯示</b-form-select-option>
                    </b-form-select>
                </div>
                <div class="col-sm-4">
                    平日/假日
                </div>
                <div class="col-sm-8">
                    <b-form-select v-model="daytype" size="sm">
                        <b-form-select-option :value="'wk'">平日</b-form-select-option>
                        <b-form-select-option :value="'ph'">假日</b-form-select-option>
                    </b-form-select>
                </div>
            </div>
        </b-modal>

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
.close-btn{
    position: fixed;
    right: 0; top: 0;
    z-index: 2;
}
.settings-bar{
    position: fixed;
    right: 5px; bottom: 2px;
    z-index: 3;
}
.zoom-bar{
    position: fixed;
    left: 5px; top: 2px;
    z-index: 2;
    display: flex;
    align-items: center;
}
</style>