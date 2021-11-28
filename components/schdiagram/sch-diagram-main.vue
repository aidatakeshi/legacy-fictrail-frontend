<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    const config = require('~/schdiagram-config.js');

    import {
        BIcon, BIconX, BIconGear, BIconBookshelf, BIconClock, BIconZoomIn, BIconZoomOut, BIconEyeglasses,
    } from 'bootstrap-vue'
    import SchDiagramGrid from './sch-diagram-grid.vue';
    import SchDiagramHeaderFrame from './sch-diagram-header-frame.vue';
    import SchDiagramLabelStations from './sch-diagram-label-stations.vue';
    import SchDiagramLabelTime from './sch-diagram-label-time.vue';
    import SchDiagramTripLines from './sch-diagram-trip-lines.vue';
    import SchDiagramTripTouchPoint from './sch-diagram-trip-touch-point.vue';

    export default {
        components: {
            BIcon, BIconX, BIconGear, BIconBookshelf, BIconClock, BIconZoomIn, BIconZoomOut, BIconEyeglasses,
            SchDiagramHeaderFrame, SchDiagramGrid, SchDiagramLabelStations, SchDiagramLabelTime,
            SchDiagramTripLines, SchDiagramTripTouchPoint,
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
                /**
                 * How to show opposite-direction lines (when direction != null):
                 * 0: Always hide
                 * 1: Show low-key on single-track; hide on multi-track
                 * 2: Show normally on single-track; hide on multi-track
                 * 3: Always show low-key
                 * 4: Show normally on single track; show low-key on multi-track
                 */
                showOppositeDirection: 4, //Show opposite-direction track low-key? (when direction != null)
                expressTrack: null, //true (express track only) / false (local track only) / null (both)
                showAnotherTrack: true, //Show another track low-key? (when expressTrack != null)
                //Screen Size
                screenWidth: null,
                screenHeight: null,
                contentWidth: null,
                contentHeight: null,
                contentMidX: null,
                contentMidY: null,
                //Display-related Variables
                xpos: config.xpos_default,
                ypos: 0,
                xscale: config.xscale_default,
                yscale: 0,
                //Selection
                selectedTrip_direction: null,
                selectedTrip_daytype: null,
                selectedTrip_i: null,
                //Tooltip
                tooltip: null,
                tooltip_x: null,
                tooltip_y: null,
                tooltip_by_click: null,
                //Others
                touchLastDist: null,
                touchDirection: null,
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
                this.loadLocalStorage();
                this.handleScreenResized();
                this.transformationUpdated();
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

            //Local Storage Handling
            loadLocalStorage(){
                var data = localStorage.getItem(`schdiagram`);
                if (data){
                    data = JSON.parse(data);
                    for (var key in data){
                        this[key] = data[key];
                    }
                }
                var data = localStorage.getItem(`schdiagram/${this.line_id}`);
                if (data){
                    data = JSON.parse(data);
                    for (var key in data){
                        this[key] = data[key];
                    }
                }
            },
            saveLocalStorage(){
                var data = {
                    showOppositeDirection: this.showOppositeDirection,
                    expressTrack: this.expressTrack,
                    showAnotherTrack: this.showAnotherTrack,
                };
                localStorage.setItem(`schdiagram`, JSON.stringify(data));
                var data = {
                    xpos: this.xpos, xscale: this.xscale,
                    ypos: this.ypos, yscale: this.yscale,
                };
                localStorage.setItem(`schdiagram/${this.line_id}`, JSON.stringify(data));
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

            //Transformation Updated
            transformationUpdated(target = null){
                //Scale Constraint
                if (this.xscale < config.xscale_min) this.xscale = config.xscale_min;
                if (this.xscale > config.xscale_max) this.xscale = config.xscale_max;
                if (this.yscale < config.yscale_min) this.yscale = config.yscale_min;
                if (this.yscale > config.yscale_max) this.yscale = config.yscale_max;
                if (this.xscale < this.contentWidth / this.basisWidth) this.xscale = this.contentWidth / this.basisWidth;
                if (this.yscale < this.contentHeight / this.basisHeight) this.yscale = this.contentHeight / this.basisHeight;
                //Position Constraint
                var xpos_min = this.contentWidth / 2 / this.basisWidth / this.xscale;
                var ypos_min = this.contentHeight / 2 / this.basisHeight / this.yscale;
                if (this.xpos < xpos_min) this.xpos = xpos_min;
                else if (this.xpos > 1 - xpos_min) this.xpos = 1 - xpos_min;
                if (this.ypos < ypos_min) this.ypos = ypos_min;
                else if (this.ypos > 1 - ypos_min) this.ypos = 1 - ypos_min;
                //Adjust xpos, ypos
                if (target){
                    target.setAttr('x', this.contentMidX - this.xpos * this.basisWidth * this.xscale);
                    target.setAttr('y', this.contentMidY - this.ypos * this.basisHeight * this.yscale);
                }
                //Redraw
                this.draw();
            },

            //Reset x/y pos/scale
            resetView(){
                [this.xpos, this.ypos, this.xscale, this.yscale] = [config.xpos_default, 0, config.xscale_default, 0];
                this.transformationUpdated();
                this.saveLocalStorage();
            },

            //Zoom In / Out Buttons
            zoom(d, isIn){
                if (isIn){
                    this[d+'scale'] *= config.scale_step;
                }else{
                    this[d+'scale'] /= config.scale_step;
                }
                this.transformationUpdated();
            },

            //Toggle Buttons
            toggle(attr, options){
                var index = options.indexOf(this[attr]);
                if (index === -1){
                    this[attr] = options[0];
                }else{
                    this[attr] = options[(index + 1) % options.length];
                }
                this.saveLocalStorage();
            },

            /**
             * Handlers
             */
            handleScreenResized(){
                if (this.showing){
                    this.screenWidth = window.innerWidth;
                    this.screenHeight = window.innerHeight;
                    this.contentWidth = window.innerWidth - config.margin_left - config.margin_right;
                    this.contentHeight = window.innerHeight - config.margin_top - config.margin_bottom;
                    this.contentMidX = config.margin_left + this.contentWidth / 2;
                    this.contentMidY = config.margin_top + this.contentHeight / 2;
                    this.transformationUpdated();
                    this.saveLocalStorage();
                }
            },
            handleWheelRoll(e){
                e.evt.preventDefault();
                var multiply = (e.evt.deltaY > 1) ? 1/config.scroll_step : config.scroll_step;
                this.xscale *= multiply;
                this.yscale *= multiply;
                this.transformationUpdated();
                this.saveLocalStorage();
            },
            handleDragStart(event){
                this.isDragging = true;
            },
            handleDragMove(event){
                var x = event.target.getAttr('x');
                var y = event.target.getAttr('y');
                //Calculate xpos, ypos
                this.xpos = (this.contentMidX - x) / this.basisWidth / this.xscale;
                this.ypos = (this.contentMidY - y) / this.basisHeight / this.yscale;
                this.transformationUpdated(event.target);
            },
            handleDragEnd(event){
                this.isDragging = false;
                this.touchLastDist = null;
                this.saveLocalStorage();
            },
            handleTouchStart(event){
                this.hideTooltip();
            },
            handleTouchMove(event){
                var touch1 = event.evt.touches[0];
                var touch2 = event.evt.touches[1];
                if (touch1 && touch2){
                    var dist_x = (touch2.clientX - touch1.clientX) / this.xscale;
                    var dist_y = (touch2.clientY - touch1.clientY) / this.yscale;
                    if (!this.touchLastDist){
                        this.touchDirection = (dist_x > dist_y) ? 'x' : 'y';
                        this.touchLastDist = (this.touchDirection == 'x') ? dist_x : dist_y;
                    }
                    if (this.touchDirection == 'x'){
                        this.xscale = this.xscale / this.touchLastDist * dist_x;
                    }else{
                        this.yscale = this.yscale / this.touchLastDist * dist_y;
                    }
                    this.touchLastDist = (this.touchDirection == 'x') ? dist_x : dist_y;
                    this.transformationUpdated();
                }
            },
            handleTouchEnd(event){
                this.touchLastDist = null;
                this.saveLocalStorage();
            },

            //Tooltip
            showTooltip(captions, x, y, isClick = false){
                this.tooltip_x = x;
                this.tooltip_y = y;
                this.tooltip_by_click = isClick;
                this.tooltip = captions;
            },
            hideTooltip(){
                this.tooltip = null;
            },
            getTooltipPositioning(){
                var obj = {};
                if (this.tooltip_x < this.screenWidth / 2){
                    obj.left = (this.tooltip_x + 5) + 'px';
                }else{
                    obj.right = (this.screenWidth - this.tooltip_x + 5) + 'px';
                }
                if (this.tooltip_y < this.screenHeight / 2){
                    obj.top = (this.tooltip_y + 5) + 'px';
                }else{
                    obj.bottom = (this.screenHeight - this.tooltip_y + 5) + 'px';
                }
                return obj;
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

                <!-- Grid (Draggable) -->
                <v-group @dragstart="handleDragStart" @dragmove="handleDragMove" @dragend="handleDragEnd"
                @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
                    <sch-diagram-grid :config="getKonvasConfig(true)"
                        :data-stations="data_stations" :data-line="data_line"
                        :xscale="xscale" :yscale="yscale" :xpos="xpos" :ypos="ypos"
                        :contentWidth="contentWidth" :contentHeight="contentHeight"
                    />
                </v-group>

                <!-- Trips (Lines) -->
                <template v-if="direction == 'up'">
                    <!-- Upbound at Upper Layer -->
                    <sch-diagram-trip-lines :config="getKonvasConfig(false)"
                        :data="(data.dn[daytype]||{}).schedule||[]" dataDirection="dn"
                        :xscale="xscale" :yscale="yscale" :xpos="xpos" :ypos="ypos"
                        :contentWidth="contentWidth" :contentHeight="contentHeight"
                        :expressTrack="expressTrack" :direction="direction"
                        :showOppositeDirection="showOppositeDirection"
                        :showAnotherTrack="showAnotherTrack"
                    />
                    <sch-diagram-trip-lines :config="getKonvasConfig(false)"
                        :data="(data.up[daytype]||{}).schedule||[]" dataDirection="up"
                        :xscale="xscale" :yscale="yscale" :xpos="xpos" :ypos="ypos"
                        :contentWidth="contentWidth" :contentHeight="contentHeight"
                        :expressTrack="expressTrack" :direction="direction"
                        :showOppositeDirection="showOppositeDirection"
                        :showAnotherTrack="showAnotherTrack"
                    />
                    <sch-diagram-trip-touch-point :config="getKonvasConfig(false)"
                        :data="(data.dn[daytype]||{}).schedule||[]" dataDirection="dn"
                        :xscale="xscale" :yscale="yscale" :xpos="xpos" :ypos="ypos"
                        :contentWidth="contentWidth" :contentHeight="contentHeight"
                        @show-tooltip="showTooltip" @hide-tooltip="hideTooltip"
                    />
                    <sch-diagram-trip-touch-point :config="getKonvasConfig(false)"
                        :data="(data.up[daytype]||{}).schedule||[]" dataDirection="up"
                        :xscale="xscale" :yscale="yscale" :xpos="xpos" :ypos="ypos"
                        :contentWidth="contentWidth" :contentHeight="contentHeight"
                        @show-tooltip="showTooltip" @hide-tooltip="hideTooltip"
                    />
                </template>
                <template v-else>
                    <!-- Downbound at Upper Layer -->
                    <sch-diagram-trip-lines :config="getKonvasConfig(false)"
                        :data="(data.up[daytype]||{}).schedule||[]" dataDirection="up"
                        :xscale="xscale" :yscale="yscale" :xpos="xpos" :ypos="ypos"
                        :contentWidth="contentWidth" :contentHeight="contentHeight"
                        :expressTrack="expressTrack" :direction="direction"
                        :showOppositeDirection="showOppositeDirection"
                        :showAnotherTrack="showAnotherTrack"
                    />
                    <sch-diagram-trip-lines :config="getKonvasConfig(false)"
                        :data="(data.dn[daytype]||{}).schedule||[]" dataDirection="dn"
                        :xscale="xscale" :yscale="yscale" :xpos="xpos" :ypos="ypos"
                        :contentWidth="contentWidth" :contentHeight="contentHeight"
                        :expressTrack="expressTrack" :direction="direction"
                        :showOppositeDirection="showOppositeDirection"
                        :showAnotherTrack="showAnotherTrack"
                    />
                    <sch-diagram-trip-touch-point :config="getKonvasConfig(false)"
                        :data="(data.up[daytype]||{}).schedule||[]" dataDirection="up"
                        :xscale="xscale" :yscale="yscale" :xpos="xpos" :ypos="ypos"
                        :contentWidth="contentWidth" :contentHeight="contentHeight"
                        @show-tooltip="showTooltip" @hide-tooltip="hideTooltip"
                    />
                    <sch-diagram-trip-touch-point :config="getKonvasConfig(false)"
                        :data="(data.dn[daytype]||{}).schedule||[]" dataDirection="dn"
                        :xscale="xscale" :yscale="yscale" :xpos="xpos" :ypos="ypos"
                        :contentWidth="contentWidth" :contentHeight="contentHeight"
                        @show-tooltip="showTooltip" @hide-tooltip="hideTooltip"
                    />
                </template>

                <!-- Frame -->
                <sch-diagram-header-frame :screenWidth="screenWidth" :screenHeight="screenHeight" />

                <!-- Label Stations -->
                <sch-diagram-label-stations :yscale="yscale" :ypos="ypos"
                    :data-stations="data_stations" :data-line="data_line"
                    :screenWidth="screenWidth" :contentHeight="contentHeight" :contentMidY="contentMidY"
                />

                <!-- Label Time -->
                <sch-diagram-label-time :xscale="xscale" :xpos="xpos"
                    :contentWidth="contentWidth" :contentMidX="contentMidX"
                />

                <!-------------------------------------------------------------------->
            </v-layer>
        </v-stage>

        <!-- Label Tooltip -->
        <div class="my-tooltip" v-if="tooltip && !isDragging" :style="getTooltipPositioning()">
            <div v-for="(item, i) in tooltip" :key="i">{{item}}</div>
        </div>

        <!-- Zoom Buttons -->
        <div class="zoom-bar">
            <b-button variant="outline-dark" class="px-1 py-0" @click="resetView()">
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
        </div>

        <!-- Close Button -->
        <b-button variant="link" class="close-btn py-1 px-2" @click="hide()">
            <b-icon-x variant="dark" scale="1.4" />
        </b-button>

        <!-- Settings Bar -->
        <div class="settings-bar">
            <b-button class="px-2 py-0" :variant="direction ? 'secondary' : 'primary'"
            @click="toggle('direction', ['up', 'dn', null])">
                {{(direction == 'up') ? '上行' : (direction == 'dn') ? '下行' : '雙向'}}
            </b-button>
            <b-button class="px-2 py-0"
            :variant="(expressTrack === null) ? 'primary' : 'secondary'"
            @click="toggle('expressTrack', [true, false, null])">
                {{(expressTrack === true) ? '快線' : (expressTrack === false) ? '慢線' : '快慢'}}
            </b-button>
            <b-button class="px-2 py-0" :variant="daytype == 'ph' ? 'danger' : 'success'"
            @click="toggle('daytype', ['wk', 'ph'])">
                {{(daytype == 'ph') ? '假日' : '平日'}}
            </b-button>
            <b-button class="px-1 py-0" variant="secondary" @click="$refs.settings_modal.show()">
                <b-icon-gear />
            </b-button>
        </div>

        <!-- Settings Modal -->
        <b-modal ref="settings_modal" title="顯示設定" header-bg-variant="dark" header-text-variant="light"
        hide-footer centered scrollable @hide="saveLocalStorage()">
            <div class="row">
                <div class="col-sm-4">
                    方向
                </div>
                <div class="col-sm-8">
                    <b-form-radio-group v-model="direction" size="sm" buttons class="mb-2 w-100">
                        <b-form-radio :value="null">雙向</b-form-radio>
                        <b-form-radio :value="'up'">上行</b-form-radio>
                        <b-form-radio :value="'dn'">下行</b-form-radio>
                    </b-form-radio-group>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-4">
                    反方向顯示方式
                </div>
                <div class="col-sm-8">
                    <b-form-radio-group v-model="showOppositeDirection" :disabled="direction === null"
                    size="sm" buttons stacked class="mb-2 w-100">
                        <b-form-radio :value="0">全部隱藏</b-form-radio>
                        <b-form-radio :value="3">全部低調顯示</b-form-radio>
                        <b-form-radio :value="1">在單線低調顯示；在複線區間隱藏</b-form-radio>
                        <b-form-radio :value="2">在單線正常顯示；在複線區間隱藏</b-form-radio>
                        <b-form-radio :value="4">在單線正常顯示；在複線低調顯示</b-form-radio>
                    </b-form-radio-group>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-4">
                    快慢線 <small>(在四線區間)</small>
                </div>
                <div class="col-sm-8">
                    <b-form-radio-group v-model="expressTrack" size="sm" buttons class="mb-2 w-100">
                        <b-form-radio :value="null">兩者皆顯示</b-form-radio>
                        <b-form-radio :value="true">快線</b-form-radio>
                        <b-form-radio :value="false">慢線</b-form-radio>
                    </b-form-radio-group>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-4">
                    另一線顯示方式
                </div>
                <div class="col-sm-8">
                    <b-form-radio-group v-model="showAnotherTrack" :disabled="expressTrack === null"
                    size="sm" buttons class="mb-2 w-100">
                        <b-form-radio :value="false">隱藏</b-form-radio>
                        <b-form-radio :value="true">低調顯示</b-form-radio>
                    </b-form-radio-group>
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
.my-tooltip{
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 0.75rem;
    padding: 0.3rem;
    border-radius: 0.3rem;
    position: fixed;
    z-index: 102;
}
</style>