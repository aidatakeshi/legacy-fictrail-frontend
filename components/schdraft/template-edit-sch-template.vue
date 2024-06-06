<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const sd_common = require('~/schdraft-common.js');

import {
    BIcon, BIconPencilSquare, BIconX, BIconPlus, BIconTrash, BIconArrowUp, BIconArrowDown, BIconTable, BIconGraphDown,
} from 'bootstrap-vue'
import TemplateEditSchTemplateRow from './template-edit-sch-template-row.vue';
import TemplateEditSchTemplateRowCross from './template-edit-sch-template-row-cross.vue';
import TemplateEditSchTemplateFirstStation from './template-edit-sch-template-first-station.vue';
import TemplateEditSchTemplateRowMenu from './template-edit-sch-template-row-menu.vue';
import TemplateEditSchTemplateRowActionModals from './template-edit-sch-template-row-action-modals.vue';
import TemplateEditSchTemplateShiftTime from './template-edit-sch-template-shift-time.vue';
import SchDiagramMain from '../schdiagram/sch-diagram-main.vue';

    import ListItem from '@/components/list-item';
    import EditItem from '@/components/edit-item';
    import ButtonNew from '@/components/button-new';
    import EditLineStations from '@/components/edit-line-stations';
    import LineTimetable from '@/components/line-timetable';
    import NameLine from '@/components/name-line';

export default {
    components:{
        BIcon, BIconPencilSquare, BIconX, BIconPlus, BIconTrash, BIconArrowUp, BIconArrowDown, BIconTable, BIconGraphDown,
        TemplateEditSchTemplateRow,
        TemplateEditSchTemplateRowCross,
        TemplateEditSchTemplateFirstStation,
        TemplateEditSchTemplateRowMenu,
        TemplateEditSchTemplateRowActionModals,
        TemplateEditSchTemplateShiftTime,
        SchDiagramMain,
        ListItem, EditItem, ButtonNew, EditLineStations, LineTimetable, NameLine,
    },
    props: {
        value: Object,
        vehiclePerformanceId: String,
    },
    data() {
        return {
            row_menu_index: null,
            info: [],
        };
    },
    watch: {
        vehiclePerformanceId(val){
            if (val) this.getSchTemplateInfo();
        }
    },
    mounted(){
    },
    methods:{
        changed(){
            this.$emit('input', this.value);
        },

        //Get Info
        async getSchTemplateInfo(){
            var response = await $.callAPI(axios, 'POST', 'schdraft-editor/sch-template-info', {
                vehicle_performance_id: this.vehiclePerformanceId,
                sch_template: this.value?.sch_template || [],
            })
            if (response.http_status >= 400) return false;
            this.info = response.data;
            this.$forceUpdate();
        },

        //Get Previous Stop Item (bypassing items with is_cross)
        getPrevStopItem(index){
            if (!(this.value.sch_template||[]).length) return {};
            for (var i = index - 1; i >= 0; i--){
                if (!this.value.sch_template[i].is_cross){
                    return this.value.sch_template[i];
                }
            }
            return {};
        },

        //Whether Line Header Needed
        lineHeaderNeeded(index){
            if (this.value.sch_template[index].is_cross) return false;
            var thisItem = this.value.sch_template[index] || {};
            if (!thisItem.line_id) return false;
            var prevItem = this.getPrevStopItem(index);
            if (thisItem.line_id != prevItem.line_id) return true;
            if (thisItem.is_upbound != prevItem.is_upbound) return true;
            return false;
        },

        //Get Previous / Next Time Value (excluding items with is_cross)
        getPrevTimeValue(index){
            if (!(this.value.sch_template||[]).length) return null;
            for (var i = index - 1; i >= 0; i--){
                if (this.value.sch_template[i].is_cross) continue;
                if (this.value.sch_template[i].time2) return this.value.sch_template[i].time2;
                if (this.value.sch_template[i].time1) return this.value.sch_template[i].time1;
            }
            return null;
        },
        getNextTimeValue(index){
            if (!(this.value.sch_template||[]).length) return null;
            for (var i = index + 1; i < this.value.sch_template.length; i++){
                if (this.value.sch_template[i].is_cross) continue;
                if (this.value.sch_template[i].time1) return this.value.sch_template[i].time1;
                if (this.value.sch_template[i].time2) return this.value.sch_template[i].time2;
            }
            return null;
        },

        //Show Modal
        showEditStationModal(id){
            this.$refs.edit_station_modal.showEdit(id);
        },
        showEditLineStationsModal(i){
            var line_id = this.value.sch_template[i].line_id;
            this.$refs.edit_line_stations_modal.show(line_id);
        },
        showTimetableModal(i){
            var line_id = this.value.sch_template[i].line_id;
            var direction = this.value.sch_template[i].is_upbound ? 'up' : 'dn';
            this.$refs.timetable_modal.show(line_id, direction, this.value.id);
        },
        showLineDiagram(i){
            var line_id = this.value.sch_template[i].line_id;
            var direction = this.value.sch_template[i].is_upbound ? 'up' : 'dn';
            this.$refs.line_diagram_modal.show(line_id, direction, this.value.id);
        },

        //Insert First Station
        insertFirstStation(station_id){
            this.value.sch_template.push(sd_common.getNewStationItem({station_id: station_id}));
            this.changed();
            this.getSchTemplateInfo();
        },

        //Row Menu
        showRowMenu(index){
            this.row_menu_index = index;
            this.$refs.row_menu_modal.show();
        },
        rowMenuAction(index, action, isUpper){
            this.$refs.row_menu_modal.hide();
            this.$refs.row_action_modals.showModal(index, action, isUpper);
        },

    },
    computed: {
        secondStopIndex(){
            for (var i = 1; i < (this.value.sch_template||[]).length; i++){
                if (!this.value.sch_template[i].is_cross) return i;
            }
        },
    },
}
</script>

<template>
    <div>

        <!-- Buttons -->
        <div class="mb-2">
            <b-button class="px-1 py-0" variant="outline-secondary" @click="$refs.shift_time_modal.show()">
                推前/推後時間
            </b-button>
        </div>

        <!-- Main Table -------------------------------------------------------------------------->
        <div class="table-responsive mb-0" v-if="(value.sch_template||[]).length">
            <table class="table table-bordered my-table">
                <!-- Header ------------------------------------------------------------>
                <thead>
                    <tr class="thead-light">
                        <th></th>
                        <th style="min-width: 7em;">車站</th>
                        <th style="line-height: 1em;">距離<br/><small>(km)</small></th>
                        <th style="line-height: 1em;">里程<br/><small>(km)</small></th>
                        <th style="width: 1em;"></th>
                        <th style="min-width: 6em; width: 6em;">時刻<br/><small>(預設)</small></th>
                        <th></th>
                        <th style="line-height: 1em;">月台<br/><small>/軌道</small></th>
                        <th>快線</th>
                        <th>Mods</th>
                        <th>備註</th>
                    </tr>
                </thead>
                <!-- Body -------------------------------------------------------------->
                <tbody>
                    <template v-for="(item, i) in value.sch_template">
                        <!-- Line Header-->
                        <tr class="thead-dark text-light" :key="i+'h'" v-if="lineHeaderNeeded(i)">
                            <th />
                            <th colspan="10" class="text-left">
                                <div class="d-flex align-items-center">
                                    <div class="mr-2">
                                        <name-line color :id="value.sch_template[i].line_id" />
                                        <small>
                                            ({{value.sch_template[i].is_upbound ? '上行' : '下行'}})
                                        </small>
                                    </div>
                                    <b-button variant="outline-light" class="ml-1 p-0" size="sm"
                                    @click="showEditLineStationsModal(i)">
                                        <b-icon-pencil-square /> 查看車站
                                    </b-button>
                                    <b-button variant="outline-light" class="ml-1 p-0" size="sm"
                                    @click="showTimetableModal(i)">
                                        <b-icon-table /> 時刻表
                                    </b-button>
                                    <b-button variant="outline-light" class="ml-1 p-0" size="sm"
                                    @click="showLineDiagram(i)">
                                        <b-icon-graph-down /> 運行圖
                                    </b-button>
                                </div>
                            </th>
                        </tr>
                        <!-- Stopping Station (Cross ID Not Exists) -->
                        <template-edit-sch-template-row v-if="!value.sch_template[i].is_cross"
                            v-model="value.sch_template[i]" :key="i" :index="i"
                            :info="info[i] || {}"
                            :is-first="i == 0" :is-second="i == secondStopIndex"
                            :is-last="i == value.sch_template.length - 1"
                            :prev-value="getPrevTimeValue(i)" :next-value="getNextTimeValue(i)"
                            :prev-item="getPrevStopItem(i)"
                            @show-menu="showRowMenu"
                            @edit-station="showEditStationModal"
                        />
                        <!-- Crossing (Cross ID Exists) -->
                        <template-edit-sch-template-row-cross v-else
                            v-model="value.sch_template[i]" :key="i" :index="i"
                            :info="info[i] || {}"
                            @show-menu="showRowMenu"
                        />
                        <!-------------------------------------------->
                    </template>
                </tbody>
            </table>
        </div>

        <!-- First Station Dialog -->
        <template-edit-sch-template-first-station v-if="!(value.sch_template||[]).length"
        @selected="insertFirstStation" />

        <!-- Shift Time -->
        <template-edit-sch-template-shift-time ref="shift_time_modal" v-model="value.sch_template" />

        <!-- Row Menu -->
        <b-modal ref="row_menu_modal" size="sm" hide-header hide-footer centered>
            <template-edit-sch-template-row-menu :sch-template="value.sch_template||[]" :index="row_menu_index"
            @menu="rowMenuAction" />
        </b-modal>
        
        <!-- Edit Line Stations Modals -->
        <template-edit-sch-template-row-action-modals ref="row_action_modals" v-model="value.sch_template"
        @input="getSchTemplateInfo()" />

        <!-- Edit Station Modal -->
        <edit-item ref="edit_station_modal" type="station" />

        <!-- Edit Line Stations Modal -->
        <edit-line-stations ref="edit_line_stations_modal" @hide="getSchTemplateInfo" />

        <!-- View Line Timetable -->
        <line-timetable ref="timetable_modal" />

        <!-- Line Diagram -->
        <sch-diagram-main ref="line_diagram_modal" />

        <!---------------------------------------------------------------------------------------->

    </div>
</template>