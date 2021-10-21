<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    const config = require('~/mapedit-config.js');
    const _ = require('~/mapedit.js');
    const _data = require('~/mapedit-data-handling.js');

    import {
        BIcon, BIconChevronUp, BIconChevronDown, BIconChevronLeft, BIconChevronRight,
        BIconEyeglasses, BIconXDiamondFill, BIconXDiamond, BIconCompass, BIconCompassFill,
        BIconZoomIn, BIconZoomOut,
    } from 'bootstrap-vue'

    import MapLine from './map-line.vue';
    import MapLineEditor from './map-line-editor.vue';
    import MapStation from './map-station.vue';
    import MapScaleNCompass from './map-scale-n-compass.vue';
    import MapChoosePositionIndicator from './map-choose-position-indicator.vue';
    import MapOverlayMain from './map-overlay-main.vue';
    import MapOverlayLine from './map-overlay-line.vue';
    import MapOverlayStation from './map-overlay-station.vue';

    export default {
        components: {
            BIcon, BIconChevronUp, BIconChevronDown, BIconChevronLeft, BIconChevronRight,
            BIconEyeglasses, BIconXDiamondFill, BIconXDiamond, BIconCompass, BIconCompassFill,
            BIconZoomIn, BIconZoomOut,
            MapLine, MapLineEditor, MapStation, MapScaleNCompass, MapChoosePositionIndicator,
            MapOverlayMain, MapOverlayLine, MapOverlayStation,
        },
        
        head(){
            return {
                link: [
                    {rel: 'stylesheet', href: '/mapedit.css'},
                ],
            };
        },

        data() {
            return {
                config: config,
                //Screen Size
                screenWidth: (typeof window !== 'undefined') ? window.innerWidth : null,
                screenHeight: (typeof window !== 'undefined') ? window.innerHeight : null,
                //Display-related Variables
                xpos: 0.5,
                ypos: 0.5,
                zoom: 1,
                displayRefMap: false,
                displayCompass: false,
                //Image Object
                baseMap: null,
                refMap: null,
                //Data
                line_type_ids: [],
                line_type_ids_reversed: [],
                data_line_types: {},    //data_line_types[line_type_id]
                data_lines: {},         //data_lines[line_id]
                data_stations: {},      //data_stations[station_id]
                data_prefectures: {},   //data_prefectures[prefecture_id]
                data_operators: {},     //data_operators[operator_id]
                //Input Device States
                touchLastDist: null,
                //New / Choose Station Mode
                newStationMode: false,
                chooseStationX: null,
                chooseStationY: null,
                chooseStationMode: false,
                chooseStationForLineEditor: false, //If not, it is for overlay
                chooseStationResult_LineEditor: null,
                chooseStationResult_Overlay: null,
                //Selection
                editable: true,
                selectedType: null, //station, line
                selectedID: null,
                selectedLineStationIndex: null,
                selectedLineSegmentIndex: null,
                //Tooltip
                tooltip: null,
                tooltip_x: null,
                tooltip_y: null,
                //Trigger
                triggerOverlay: 0,
                triggerLines: 0,
                triggerStations: 0,
                //Others
                showOverlay: false,
                is_dragging: false,
                status_loading: null,
                isLoaded: false,
            };
        },

        mounted(){
            _.loadLocalStorage(this);
            _.initializeListeners(this);
            this.init();
        },

        beforeDestroy(){
            _.removeListeners(this);
        },

        methods: {

            async init(){
                this.isLoaded = false;
                await _data.loadAll(this, axios);
                this.isLoaded = true;
                this.triggerOverlay++;
            },

            /**
             * Redraw
             */
            draw(){
                this.$forceUpdate();
            },

            /**
             * Overlay Buttons
             */
            toggleOverlay(){
                this.showOverlay = !this.showOverlay;
                _.saveLocalStorage(this);
            },
            toggleRefMap(){
                this.displayRefMap = !this.displayRefMap;
                _.saveLocalStorage(this);
            },
            toggleCompass(){
                this.displayCompass = !this.displayCompass;
                _.saveLocalStorage(this);
            },
            zoomReset(){
                this.zoom = 1;
                _.constraintBaseMapTransformation(this);
                _.saveLocalStorage(this);
            },
            zoomOut(){
                this.zoom /= config.zoom_button_step;
                _.constraintBaseMapTransformation(this);
                _.saveLocalStorage(this);
            },
            zoomIn(){
                this.zoom *= config.zoom_button_step;
                _.constraintBaseMapTransformation(this);
                _.saveLocalStorage(this);
            },

            /**
             * Display Line / Station in Window? (Check Bounding Box)
             */
            displayLineInWindow(line){
                if (Math.max(line.x_min, this.window_x_min) > Math.min(line.x_max, this.window_x_max)) return false;
                if (Math.max(line.y_min, this.window_y_min) > Math.min(line.y_max, this.window_y_max)) return false;
                return true;
            },
            displayStationInWindow(station){
                if (station.x < this.window_x_min) return false;
                if (station.x > this.window_x_max) return false;
                if (station.y < this.window_y_min) return false;
                if (station.y > this.window_y_max) return false;
                return true;
            },

            /**
             * Handlers (Main Overlay)
             */
            handleOverlayMain_LineSelected(line_id){
                this.selectedType = 'line';
                this.selectedID = line_id;
            },
            handleOverlayMain_NewStation(){
                this.newStationMode = true;
                this.chooseStationX = null;
                this.chooseStationY = null;
            },
            /**
             * Handlers (Map Movement Related)
             */

            //Handle Image Loaded
            handleRefMapLoaded(){
                this.refMap = document.getElementById("jpg");
            },
            handleBaseMapLoaded(){
                this.baseMap = document.getElementById("svg");
            },
            //Handle Screen Resized
            handleScreenResized(){
                this.screenWidth = window.innerWidth;
                this.screenHeight = window.innerHeight;
                _.constraintBaseMapTransformation(this);
            },
            //Handle Main Group Dragging
            handleBaseMapDragStart(event){
            },
            handleBaseMapDragMove(event){
                var x = event.target.getAttr('x');
                var y = event.target.getAttr('y');
                //Calculate xpos, ypos
                this.xpos = (this.screenWidth / 2 - x) / config.map_width / this.zoom;
                this.ypos = (this.screenHeight / 2 - y) / config.map_height / this.zoom;
                _.constraintBaseMapTransformation(this, event.target);
            },
            handleBaseMapDragEnd(event){
                this.touchLastDist = 0;
                _.saveLocalStorage(this);
            },
            //Handle Main Map Clicked
            handleBaseMapClicked(event){
                if (this.newStationMode){
                    var {x, y} = _.getXYFromClickEvent(event, this);
                    this.chooseStationX = x;
                    this.chooseStationY = y;
                }
            },
            handleBaseMapRightClicked(event){
                event.evt.preventDefault();
            },
            //Handle Mobile Touch -> Zoom
            handleBaseMapTouchStart(event){
                this.handleBaseMapClicked(event);
            },
            handleBaseMapTouchMove(event){
                var touch1 = event.evt.touches[0];
                var touch2 = event.evt.touches[1];
                if (touch1 && touch2) {
                    var dx = touch2.clientX - touch1.clientX;
                    var dy = touch2.clientY - touch1.clientY;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (!this.touchLastDist) this.touchLastDist = dist;
                    this.zoom = this.zoom / this.touchLastDist * dist;
                    this.touchLastDist = dist;
                    _.constraintBaseMapTransformation(this);
                }
            },
            handleBaseMapTouchEnd(event){
                this.touchLastDist = null;
                _.saveLocalStorage(this);
            },
            //Handle Wheel Roll -> Zoom
            handleWheelRoll(e){
                e.evt.preventDefault();
                const dy = e.evt.deltaY;
                if (dy < 0) this.zoom *= config.scroll_zoom_step;
                else if (dy > 0) this.zoom /= config.scroll_zoom_step;
                _.constraintBaseMapTransformation(this);
                _.saveLocalStorage(this);
            },
            //Handle Key Press
            handleKeyDown(e){
                if (this.selectedType == 'station') return _.keyDownMoveStation(this, e.keyCode);
                if (this.selectedType == 'line') return _.keyDownMoveLineControlPoint(this, e.keyCode);
            },
            handleKeyUp(e){
            },

            /**
             * Handlers (Station Related)
             */
            handleStationClicked(event, id){
                if (this.editable){
                    if (!this.newStationMode && !this.chooseStationMode){
                        this.selectedType = 'station';
                        this.selectedID = id;
                        this.triggerOverlay++;
                        return true;
                    }else if (this.chooseStationMode){
                        if (this.chooseStationForLineEditor){
                            this.chooseStationResult_LineEditor = id;
                        }else{
                            this.chooseStationResult_Overlay = id;
                        }
                        this.chooseStationMode = false;
                    }
                }
            },
            handleStationHovered(event, id){ //Show Tooltip
                this.tooltip = _.getStationTooltip(this, id);
                this.tooltip_x = event.evt.clientX;
                this.tooltip_y = event.evt.clientY;
            },
            async handleStationDragEnd(event, id){
                this.chooseStationX = event.target?.x();
                this.chooseStationY = event.target?.y();
                this.is_dragging = false;
                await _.saveStationLocation(this, axios, id, this.chooseStationX, this.chooseStationY);
            },
            handleOverlayStationClosed(){
                this.selectedType = null;
                this.selectedID = null;
                this.newStationMode = false;
            },
            handleOverlayStationRemoved(station){
                delete this.data_stations[station.id];
                this.$forceUpdate();
            },
            handleOverlayStationUpdated(station){
                this.data_stations[station.id] = station;
                this.$forceUpdate();
            },
            async moveStation(station_id, x, y){
                this.data_stations[station_id].x = x;
                this.data_stations[station_id].y = y;
                await _.saveStationLocation(this, axios, station_id, x, y);
                this.triggerStations++;
            },

            /**
             * Handlers (Line Related)
             */
            handleLineClicked(event, line_id){
                if (this.editable){
                    if (!this.newStationMode && !this.chooseStationMode){
                        if (this.selectedType == 'line') return false;
                        this.selectedType = 'line';
                        this.selectedID = line_id;
                        this.triggerOverlay++;
                        this.triggerLines++;
                        return true;
                    }
                }
            },
            handleOverlayLineClosed(line_id){
                this.selectedType = null;
                this.selectedID = null;
            },
            handleLineStationSelected(station_index){
                this.selectedLineStationIndex = station_index;
            },
            startChooseStationForOverlay(){
                this.chooseStationMode = true;
                this.chooseStationForLineEditor = false;
                this.chooseStationResult_Overlay = null;
            },
            startChooseStationForLineEditor(){
                this.chooseStationForLineEditor = true;
                this.chooseStationMode = true;
                this.chooseStationResult_LineEditor = null;
            },
            abortChooseStation(){
                this.chooseStationForLineEditor = false;
                this.chooseStationMode = false;
                this.chooseStationResult_LineEditor = null;
            },

            /**
             * Getters
             */

            //Konvas Config
            getKonvasConfig(draggable){
                return {
                    draggable: this.touchLastDist ? false : draggable,
                    scaleX: this.zoom,
                    scaleY: this.zoom,
                    x: this.screenWidth / 2 - this.xpos * config.map_width * this.zoom,
                    y: this.screenHeight / 2 - this.ypos * config.map_height * this.zoom,
                };
            },

        },

        computed: {
            window_x_min(){
                return (config.map_width * this.xpos - this.screenWidth / 2 / this.zoom);
            },
            window_x_max(){
                return (config.map_width * this.xpos + this.screenWidth / 2 / this.zoom);
            },
            window_y_min(){
                return (config.map_height * this.ypos - this.screenHeight / 2 / this.zoom);
            },
            window_y_max(){
                return (config.map_height * this.ypos + this.screenHeight / 2 / this.zoom);
            },
        },
    }

</script>

<template>
    <div>
        <!-- Images to be Used -->
        <img id="jpg" src="/images/basemap.jpg" width="7000px" height="5000px" hidden @load="handleRefMapLoaded" />
        <img id="svg" src="/images/basemap.svg" width="7000px" height="5000px" hidden @load="handleBaseMapLoaded" />
        
        <template v-if="editable && isLoaded">
            <template v-if="showOverlay">
                <!-- Overlay for Edit Station -->
                <map-overlay-station :trigger="triggerOverlay" v-if="selectedType == 'station' || newStationMode"
                    :station="!newStationMode ? data_stations[selectedID] : {}" :is-new="newStationMode"
                    :choose-station-x="chooseStationX" :choose-station-y="chooseStationY"
                    @close="handleOverlayStationClosed"
                    @station-removed="handleOverlayStationRemoved"
                    @station-updated="handleOverlayStationUpdated"
                />
                <!-- Overlay for Edit Line -->
                <map-overlay-line :trigger="triggerOverlay" v-else-if="selectedType == 'line'"
                    v-model="data_lines[selectedID]"
                    :data-stations="data_stations" :data-operators="data_operators"
                    :selected-station-index="selectedLineStationIndex"
                    @input="$forceUpdate()"
                    @close="handleOverlayLineClosed"
                    :choose-station-mode="chooseStationMode"
                    :choose-station-result="chooseStationResult_Overlay"
                    @choose-station="startChooseStationForOverlay"
                    @abort-choose-station="abortChooseStation"
                />
                <!-- Overlay for Line List -->
                <map-overlay-main :trigger="triggerOverlay" :hidden="selectedType || newStationMode"
                    :data-line-types="data_line_types" :data-lines="data_lines"
                    @line-selected="handleOverlayMain_LineSelected"
                    @new-station="handleOverlayMain_NewStation"
                    @reload="init()"
                />
            </template>
            <!-- Toggle Button -->
            <button class="map-overlay-toggle off" v-if="showOverlay" @click="toggleOverlay">
                <b-icon-chevron-left class="wide" />
                <b-icon-chevron-up class="narrow" />
            </button>
            <button class="map-overlay-toggle on" v-else @click="toggleOverlay">
                <b-icon-chevron-right class="wide" />
                <b-icon-chevron-down class="narrow" />
            </button>
        </template>

        <!-- Map Konva (Canvas) Stage -->
        <div>
            <v-stage :config="{ width: screenWidth, height: screenHeight }" @wheel="handleWheelRoll">
                <v-layer>

                    <!-- Base Map (Draggable) -->
                    <v-group ref="basemap_group" :config="getKonvasConfig(true)"
                    @mouseup="handleBaseMapClicked"
                    @touchstart="handleBaseMapTouchStart"
                    @touchmove="handleBaseMapTouchMove"
                    @touchend="handleBaseMapTouchEnd"
                    @contextmenu="handleBaseMapRightClicked"
                    @dragstart="handleBaseMapDragStart" @dragmove="handleBaseMapDragMove"
                    @dragend="handleBaseMapDragEnd">
                        <!-- Base Map (SVG) -->
                        <v-image :config="{
                            image: baseMap, x: 0, y: 0, width: config.map_width, height: config.map_height,
                        }" v-if="baseMap" />
                        <!-- Ref Map (SVG) -->
                        <v-image :config="{
                            image: refMap, x: 0, y: 0, width: config.map_width, height: config.map_height, opacity: 0.5,
                        }" v-if="refMap && displayRefMap" />
                    </v-group>

                    <!-- Map Elements on Map -->
                    <v-group ref="elements_group" :config="getKonvasConfig(false)">
                        <!-- Lines -->
                        <v-group v-for="(type_id, i) in line_type_ids_reversed" :key="i">
                            <template v-for="line_id in (data_line_types[type_id]||{}).line_ids||[]">
                                <map-line v-if="displayLineInWindow(data_lines[line_id])"
                                    :key="line_id" :line="data_lines[line_id]" :line-type="data_line_types[type_id]"
                                    :config="config" :zoom="zoom"
                                    :selected="selectedType == 'line' && selectedID == line_id"
                                    :editable="editable" :trigger="triggerLines"
                                    :listening="!chooseStationMode && !newStationMode"
                                    @click="handleLineClicked"
                                />
                            </template>
                        </v-group>
                        <!-- Stations -->
                        <template v-for="(station, station_id) in data_stations">
                            <map-station v-if="displayStationInWindow(station)"
                                :key="station_id" :station="station"
                                :config="config" :zoom="zoom"
                                :selected="selectedType == 'station' && selectedID == station_id"
                                :editable="editable" :trigger="triggerStations"
                                :listening="!newStationMode"
                                @click="handleStationClicked"
                                @mouseenter="handleStationHovered" @mouseleave="tooltip = null"
                                @dragstart="is_dragging = true" @dragend="handleStationDragEnd"
                            />
                        </template>
                        <!-- Line Editor -->
                        <map-line-editor v-if="selectedType == 'line' && selectedID" :trigger="triggerLines"
                            v-model="data_lines[selectedID].stations" :line-id="selectedID"
                            :config="config" :xpos="xpos" :ypos="ypos" :zoom="zoom"
                            :screen-width="screenWidth" :screen-height="screenHeight"
                            :listening="!chooseStationMode && !newStationMode"
                            :data-stations="data_stations"
                            @select-station="handleLineStationSelected"
                            @update="triggerOverlay++"
                            :choose-station-result="chooseStationResult_LineEditor"
                            @choose-station="startChooseStationForLineEditor"
                            @move-station="moveStation"
                        />
                        <!-- Choose Position Indicator -->
                        <map-choose-position-indicator v-if="newStationMode"
                            :x="chooseStationX" :y="chooseStationY"
                            :config="config" :zoom="zoom"
                        />
                        <!------------------------------------------------------------------------>
                    </v-group>

                    <!-- Overlay Elements on Map (Not Draggable) -->
                    <v-group>
                        <!-- Scale & Compass -->
                        <map-scale-n-compass :screen-width="screenWidth" :screen-height="screenHeight"
                            :config="config" :zoom="zoom" :show-scale="true" :show-compass="displayCompass"
                        />
                    </v-group>

                    <!------------------------------------------------------------------------------------------------>
                </v-layer>
            </v-stage>
        </div>

        <!-- Label Tooltip -->
        <div class="map-label" v-if="tooltip && !is_dragging"
        :style="{left: (tooltip_x+5)+'px', top: (tooltip_y+5)+'px'}">
            <div>{{tooltip[0]}}</div>
            <div v-for="i in (tooltip.length-1)" :key="i" style="font-size: 80%;">
                {{tooltip[i]}}
            </div>
        </div>
        
        <!-- Overlay Buttons -->
        <div style="position: fixed; bottom: 5px; right: 5px;" class="text-right">
            <!-- Status Text -->
            <strong>{{status_loading}}</strong>
            <!-- Mode Display -->
            <strong v-if="newStationMode">選擇車站位置</strong>
            <strong v-else-if="chooseStationMode">選擇現有車站</strong>
            <!-- Buttons -->
            <button class="map-nav-button" @click="zoomIn">
                <b-icon-zoom-in />
            </button><button class="map-nav-button" @click="zoomOut">
                <b-icon-zoom-out />
            </button><button class="map-nav-button" @click="zoomReset">
                <b-icon-eyeglasses />
            </button><button class="map-nav-button" v-if="!displayRefMap" @click="toggleRefMap">
                <b-icon-x-diamond />
            </button><button class="map-nav-button" v-if="displayRefMap" @click="toggleRefMap">
                <b-icon-x-diamond-fill />
            </button><button class="map-nav-button" v-if="!displayCompass" @click="toggleCompass">
                <b-icon-compass />
            </button><button class="map-nav-button" v-if="displayCompass" @click="toggleCompass">
                <b-icon-compass-fill />
            </button>
        </div>
    </div>
</template>

<style scoped>
    .map-label{
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        font-size: 0.9rem;
        padding: 0.3rem;
        border-radius: 0.3rem;
        position: fixed;
    }
</style>