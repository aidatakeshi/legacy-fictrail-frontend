<script>

    const _ = require('~/map-new.js');

    import MapLineEditorCp from './map-line-editor-cp.vue';
    import MapLineHitSegment from './map-line-hit-segment.vue';
    import MapLineEditorMenuButton from './map-line-editor-menu-button.vue';

    export default {
        components: {
            MapLineEditorCp, MapLineHitSegment, MapLineEditorMenuButton,
        },

        props: {
            lineId: String,
            value: Array,
            config: null,
            trigger: Number,
            dataStations: Object,
            listening: Boolean,
            chooseStationResult: String,
            //
            xpos: Number,
            ypos: Number,
            zoom: Number,
            screenWidth: Number,
            screenHeight: Number,
        },

        data() {
            return {
                value$: [],
                selectedSectionIndex: null,
                selectedSegmentIndex: null,
                selectedLineProportion: null,
                menu_x: null,
                menu_y: null,
                menuOptions: [],
                action: null,
            };
        },

        watch: {
            trigger(){
                this.loadSections();
            },
            chooseStationResult(station_id){
                if (station_id){
                    this.handleStationSelected(this.action, station_id);
                }
            },
        },

        async mounted(){
            this.loadSections();
        },

        methods: {

            loadSections(){
                this.value$ = this.value;
                this.$forceUpdate();
            },

            //
            last(array){
                if (!Array.isArray(array)) return array;
                return array[array.length - 1];
            },
            lastSectionIndex(){
                for (var i = this.value$.length - 1; i >= 0; i--){
                    if (!this.value$[i].to_remove) return i;
                }
                return -1;
            },
            getPrevSection(section_i){
                for (var i = section_i-1; i >= 0; i--){
                    if (!this.value$[i].to_remove) return i;
                }
                return -1;
            },
            getFirstSection(){
                for (var i = 0; i < this.value$.length; i++){
                    if (!this.value$[i].to_remove) return i;
                }
                return -1;
            },
            getLastSection(){
                for (var i = this.value$.length - 1; i >= 0; i--){
                    if (!this.value$[i].to_remove) return i;
                }
                return -1;
            },

            /**
             * Control Point Event Handlers
             */
            lineCPSelected(cp){
                var section = null;
                var segment = null;
                for (var i in cp){ //Get the one with largest section ID
                    if (section == null || cp[i].section > section){
                        section = cp[i].section;
                        segment = cp[i].segment;
                    }
                }
                if (segment == 0) section--; //First segment corresponds to previous station
                this.$emit('select-station', section);
            },
            lineCPDragMoved(cp, x, y){
                for (var i in cp){
                    var section = cp[i].section;
                    var segment = cp[i].segment;
                    var cp_id = cp[i].cp;
                    if (section < 0 || segment < 0) continue;
                    if (!this.value$?.[section]?.segments?.[segment]) continue;
                    //x, y
                    if (!cp_id){
                        this.value$[section].segments[segment].x = x;
                        this.value$[section].segments[segment].y = y;
                    }
                    //x1, y1 / x2, y2
                    else{
                        this.value$[section].segments[segment]['x'+cp_id] = x - this.value$[section].segments[segment].x;
                        this.value$[section].segments[segment]['y'+cp_id] = y - this.value$[section].segments[segment].y;
                    }
                    //Set section unsaved
                    var section_min = null;
                    for (var i in cp){
                        var section = cp[i].section;
                        var segment = cp[i].segment;
                        if (section < 0 || segment < 0) continue;
                        if (this.value$?.[section]) this.value$[section].unsaved_segments = true;
                        if (section_min === null || section < section_min) section_min = section;
                    }
                    //Adjust with adjacent segment
                    var cp$ = cp[0] || {};
                    _.adjustWithAdjacentSegment(this.value$, cp$.section, cp$.segment, cp$.cp);
                    this.$emit('input', this.value$);
                    this.$forceUpdate();
                }
            },
            lineCPDragEnd(cp, x, y){
                this.lineCPDragMoved(cp, x, y);
                this.$emit('update');
            },

            /**
             * Show Menu
             */
            pointStationMenu(event, cp){
                var {x, y} = _.getXYFromClickEvent(event, this.xyzwh);
                this.menu_x = x;
                this.menu_y = y;
                this.selectedSectionIndex = cp[0].section;
                this.selectedSegmentIndex = cp[0].segment;
                this.selectedLineProportion = null;
                //
                this.menuOptions = [];
                this.menuOptions.push({'text': '選擇車站', 'color': '#17a2b8', action: 'change-station'});
                var isFirst = this.selectedSectionIndex <= this.getFirstSection() + 1;
                var isLast = this.selectedSegmentIndex > 0;
                if (isFirst || isLast){
                    this.menuOptions.push({'text': '延長區間', 'color': '#28a745', action: 'append-section'});
                    this.menuOptions.push({'text': '移除區間', 'color': '#dc3545', action: 'remove-section'});
                }else{
                    this.menuOptions.push({'text': '移除車站', 'color': '#dc3545', action: 'remove-section-middle'});
                }
                this.menuOptions.push({'text': '此點對齊車站', 'color': '#6c757d', action: 'align-point-station'});
                this.menuOptions.push({'text': '車站對齊此點', 'color': '#9028a7', action: 'align-station-point'});
                
            },
            pointSegmentMenu(event, cp, isNextLineSegment){
                var {x, y} = _.getXYFromClickEvent(event, this.xyzwh);
                this.menu_x = x;
                this.menu_y = y;
                this.selectedSectionIndex = cp[0].section;
                this.selectedSegmentIndex = cp[0].segment;
                this.selectedLineProportion = null;
                //
                this.menuOptions = [];
                this.menuOptions.push({'text': '移除線點', 'color': '#dc3545', action: 'remove-segment'});
                this.menuOptions.push({'text': '插入車站', 'color': '#28a745', action: 'insert-section'});
                this.menuOptions.push({'text': '插入車站並對齊', action: 'insert-section-align'});
            },
            lineSegmentMenu(event, section, segment){
                var {x, y} = _.getXYFromClickEvent(event, this.xyzwh);
                this.menu_x = x;
                this.menu_y = y;
                this.selectedSectionIndex = section;
                this.selectedSegmentIndex = segment
                this.selectedLineProportion = _.getLineProportion(event, this.xyzwh, this.value$, section, segment);
                //
                var point1 = this.value$[section].segments[segment-1];
                var point2 = this.value$[section].segments[segment];
                this.menuOptions = [];
                this.menuOptions.push({'text': '插入線點', 'color': '#28a745', action: 'insert-segment'});
                if (_.isBezierCurve(point1, point2)){
                    this.menuOptions.push({'text': '轉為直線', 'color': '#6c757d', action: 'straight-segment'});
                }else{
                    this.menuOptions.push({'text': '轉為曲線', 'color': '#6c757d', action: 'bezier-segment'});
                }
                this.menuOptions.push({'text': '插入車站並對齊', action: 'insert-segment-station-align'});
            },
            lineSegmentMenu_aliasFromBezierCP(event, cp, isNextLineSegment){
                var section = cp[0].section;
                var segment = cp[0].segment + (isNextLineSegment ? 1 : 0);
                this.lineSegmentMenu(event, section, segment);
            },

            /**
             * Menu Button & Action Handler
             */
            handleMenuOverlayClick(event){
                event.evt.preventDefault();
                this.menu_x = null;
                this.menu_y = null;
            },
            handleMenuButtonClicked(action){
                this.menu_x = null;
                this.menu_y = null;
                this.action = action;
                switch (action){
                    //Section Point Actions
                    case 'change-station':
                        this.$emit('choose-station');
                    break;
                    case 'append-section':
                        this.$emit('choose-station');
                    break;
                    case 'remove-section-middle':
                        _.lineRemoveSectionMiddle(this.value$,  this.selectedSectionIndex);
                    break;
                    case 'remove-section':
                        if (!this.selectedSegmentIndex){ //Before
                            _.lineRemoveSection(this.value$, true);
                        }else{ //After
                            _.lineRemoveSection(this.value$, false);
                        }
                    break;
                    case 'align-point-station':
                        var section = this.selectedSectionIndex;    var segment = this.selectedSegmentIndex;
                        _.lineAlignPointToStation(this.value$, section, segment, this.dataStations);
                    break;
                    case 'align-station-point':
                        var section = this.selectedSectionIndex;    var segment = this.selectedSegmentIndex;
                        var station_index = section - (segment == 0 ? 1 : 0);
                        var station_id = this.value$[station_index].station_id;
                        var {x, y} = this.value$[section].segments[segment];
                        this.$emit('move-station', station_id, x, y);
                    break;
                    //Segment Point Actions
                    case 'remove-segment':
                        var section = this.selectedSectionIndex;    var segment = this.selectedSegmentIndex;
                        _.lineRemoveSegment(this.value$, section, segment);
                    break;
                    case 'insert-section':
                        this.$emit('choose-station');
                    break;
                    case 'insert-section-align':
                        this.$emit('choose-station');
                    break;
                    //Segment Line Actions
                    case 'insert-segment':
                        var section = this.selectedSectionIndex;    var segment = this.selectedSegmentIndex;
                        _.lineInsertSegment(this.value$, section, segment, this.selectedLineProportion);
                    break;
                    case 'straight-segment':
                        var section = this.selectedSectionIndex;    var segment = this.selectedSegmentIndex;
                        _.lineToStraightSegment(this.value$, section, segment);
                    break;
                    case 'bezier-segment':
                        var section = this.selectedSectionIndex;    var segment = this.selectedSegmentIndex;
                        _.lineToBezierSegment(this.value$, section, segment);
                    break;
                    case 'insert-segment-station-align':
                        this.$emit('choose-station');
                    break;
                }
                this.$emit('input', this.value$);
                this.$emit('update');
            },
            handleStationSelected(action, station_id){
                switch (action){
                    case 'change-station':
                        var section = this.selectedSectionIndex;    var segment = this.selectedSegmentIndex;
                        _.lineChangeStation(this.value$, section, segment, station_id);
                    break;
                    case 'append-section':
                        if (!this.selectedSegmentIndex){ //Before
                            _.lineAppendSection(this.lineId, this.value$, station_id, true, this.dataStations);
                        }else{ //After
                            _.lineAppendSection(this.lineId, this.value$, station_id, false, this.dataStations);
                        }
                    break;
                    case 'insert-section':
                        var section = this.selectedSectionIndex;    var segment = this.selectedSegmentIndex;
                        _.lineInsertSection(this.lineId, this.value$, station_id, section, segment);
                    break;
                    case 'insert-section-align':
                        var section = this.selectedSectionIndex;    var segment = this.selectedSegmentIndex;
                        _.lineInsertSection(this.lineId, this.value$, station_id, section, segment);
                        var {x, y} = this.value$[section].segments[segment];
                        this.$emit('move-station', station_id, x, y);
                    break;
                    case 'insert-segment-station-align':
                        var section = this.selectedSectionIndex;    var segment = this.selectedSegmentIndex;
                        _.lineInsertSegment(this.value$, section, segment, this.selectedLineProportion);
                        _.lineInsertSection(this.lineId, this.value$, station_id, section, segment);
                        var {x, y} = this.value$[section].segments[segment];
                        this.$emit('move-station', station_id, x, y);
                    break;
                }
                this.$emit('input', this.value$);
                this.$emit('update');
            },
        },

        computed: {
            xyzwh(){
                return {
                    xpos: this.xpos, ypos: this.ypos, zoom: this.zoom,
                    screenWidth: this.screenWidth, screenHeight: this.screenHeight,
                };
            },
        },
    }

</script>

<template>
    <v-group v-if="value$ && zoom >= config.line_cp_zoom_min">

        <!-- Hit Line (By Segment) -->
        <template v-if="listening">
            <v-group v-for="(section, i) in value$" :key="i">
                <template v-if="!section.to_remove && section.segments.length > 1">
                    <map-line-hit-segment v-for="j in section.segments.length-1" :key="j"
                        :segment1="section.segments[j-1]" :segment2="section.segments[j]"
                        :config="config" :zoom="zoom"
                        :sectionIndex="i" :segmentIndex="j"
                        @menu="lineSegmentMenu"
                    />
                </template>
            </v-group>
        </template>

        <!-- Section Indicator (Circle Dot) -->
        <template v-for="(section, i) in value$">
            <template v-if="section.segments.length && !section.to_remove">
                <map-line-editor-cp section :key="'sec'+i"
                    :config="config" :zoom="zoom"
                    :listening="listening"
                    :x="(section.segments[0]||{}).x-0" :y="(section.segments[0]||{}).y-0"
                    :cp="[
                        {section: i, segment: 0},
                        {section: getPrevSection(i), segment: ((value$[getPrevSection(i)]||{}).segments||[]).length-1},
                    ]"
                    @click="lineCPSelected" @dragstart="lineCPSelected"
                    @dragmove="lineCPDragMoved" @dragend="lineCPDragEnd"
                    @menu="pointStationMenu"
                />
                <map-line-editor-cp section :key="'sec'+i+'L'" v-if="i == lastSectionIndex()"
                    :config="config" :zoom="zoom"
                    :listening="listening"
                    :x="(last(section.segments)||{}).x-0" :y="(last(section.segments)||{}).y-0"
                    :cp="[
                        {section: i, segment: section.segments.length-1},
                    ]"
                    @click="lineCPSelected" @dragstart="lineCPSelected"
                    @dragmove="lineCPDragMoved" @dragend="lineCPDragEnd"
                    @menu="pointStationMenu"
                />
            </template>
        </template>

        <!-- Segment Indicator (Cross) -->
        <v-group v-for="(section, i) in value$" :key="'seg'+i">
            <template v-if="!section.to_remove">
                <template v-for="(segment, j) in section.segments">
                    <template v-if="j > 0 && j < section.segments.length-1">
                        <map-line-editor-cp segment :key="j"
                            :config="config" :zoom="zoom"
                            :listening="listening"
                            :x="segment.x-0" :y="segment.y-0"
                            :cp="[{section: i, segment: j}]"
                            @click="lineCPSelected" @dragstart="lineCPSelected"
                            @dragmove="lineCPDragMoved" @dragend="lineCPDragEnd"
                            @menu="pointSegmentMenu"
                        />
                    </template>
                </template>
            </template>
        </v-group>

        <!-- Bezier Control Point (Cross & Connecting Line) -->
        <v-group v-for="(section, i) in value$" :key="'bez'+i">
            <template v-if="!section.to_remove">
                <v-group v-for="(segment, j) in section.segments" :key="j">
                    <template v-if="segment.x2 && segment.y2 && j > 0">
                        <map-line-editor-cp bezier
                            :config="config" :zoom="zoom"
                            :listening="listening"
                            :x="segment.x*1+segment.x2*1"   :y="segment.y*1+segment.y2*1"
                            :x-origin="segment.x*1"       :y-origin="segment.y*1"
                            :cp="[{section: i, segment: j, cp: 2}]"
                            @dragstart="lineCPSelected"
                            @dragmove="lineCPDragMoved" @dragend="lineCPDragEnd"
                            @menu="lineSegmentMenu_aliasFromBezierCP"
                        />
                    </template>
                    <template v-if="segment.x1 && segment.y1 && j < section.segments.length-1">
                        <map-line-editor-cp bezier
                            :config="config" :zoom="zoom"
                            :listening="listening"
                            :x="segment.x*1+segment.x1*1"   :y="segment.y*1+segment.y1*1"
                            :x-origin="segment.x*1"         :y-origin="segment.y*1"
                            :cp="[{section: i, segment: j, cp: 1}]"
                            @dragstart="lineCPSelected"
                            @dragmove="lineCPDragMoved" @dragend="lineCPDragEnd"
                            @menu="lineSegmentMenu_aliasFromBezierCP" is-next-line-segment
                        />
                    </template>
                </v-group>
            </template>
        </v-group>

        <!-- Menu -->
        <template v-if="menu_x && menu_y">
            <!-- Overlay (to detect leaving) -->
            <v-rect :config="{
                x: 0, y: 0, width: config.map_width, height: config.map_height, opacity: 0, fill:'black',
            }"
                @contextmenu="handleMenuOverlayClick"
                @mousedown="handleMenuOverlayClick"
                @touchstart="handleMenuOverlayClick"
            />
            <!-- Display -->
            <v-group :config="{
                x: menu_x, y: menu_y, scaleX: 1/zoom, scaleY: 1/zoom,
            }">
                <!-- Display Box -->
                <v-line :config="{
                    points: config.line_edit_menu_box_function(menuOptions.length),
                    stroke: config.line_edit_menu_border_color,
                    strokeWidth: config.line_edit_menu_border,
                    fill: config.line_edit_menu_background,
                    closed: true,
                    strokeScaleEnabled: false,
                    listening: false,
                }" />
                <!-- Buttons -->
                <map-line-editor-menu-button v-for="(button, i) in menuOptions" :key="i"
                    :config="config"
                    :x="config.line_edit_menu_x_offset" :y="config.line_edit_menu_y_offset
                        + i * (config.line_edit_menu_button_height + config.line_edit_menu_button_gap)"
                    :text="button.text" :color="button.color" :action="button.action"
                    @click="handleMenuButtonClicked"
                />
            </v-group>
        </template>

        <!---------------------------------------------------------------------------------------->
    </v-group>
</template>