<script>

import axios from '~/plugins/axios'
import draggable from 'vuedraggable'
const $ = require('~/common.js');

import {
    BIcon, BIconPen, BIconPencil, BIconX, BIconPlus, BIconTrash, BIconClock,
    BIconClockFill, BIconCodeSquare, BIconPlusSquare,
} from 'bootstrap-vue'

export default {
    components:{
        BIcon, BIconPen, BIconPencil, BIconX, BIconPlus, BIconTrash, BIconClock,
        BIconClockFill, BIconCodeSquare, BIconPlusSquare,
        draggable,
    },
    props: {
        value: Array,
        isCross: Boolean,
        stationId: String,
        defaultValue: Object,
    },
    data() {
        return {
            editing_i: null,
            options_tracks: [],
            time1_type: 0,
            time2_type: 0,
            json_edit: null,
            json_edit_error: null,
        };
    },
    watch: {

    },
    mounted(){

    },
    methods:{
        displayTimeInterval: $.displayTimeInterval,
        displayTime: $.displayTime,
        //
        changed(){
            this.$emit('input', this.value);
        },
        isDefined(i, attr){
            return (this.value?.[i]?.[attr] !== null) && (this.value?.[i]?.[attr] !== undefined);
        },
        async editModItem(index){
            this.editing_i = index;
            //Track Options
            var $route = `items/station/${encodeURIComponent(this.stationId)}`;
            var response = await $.callAPI(axios, 'GET', $route);
            if (response.http_status != 200) return false;
            this.options_tracks = response.data?.tracks || [];
            //Determine time1, time2 types
            if (!this.isDefined(this.editing_i, 'time1') && !this.isDefined(this.editing_i, 'time1_shift')){
                this.time1_type = 0;
            }else if (this.value?.[this.editing_i]?.time1 === false){
                this.time1_type = 1;
            }else if (this.isDefined(this.editing_i, 'time1_shift')){
                this.time1_type = 3;
            }else{
                this.time1_type = 2;
            }
            if (!this.isDefined(this.editing_i, 'time2') && !this.isDefined(this.editing_i, 'time2_shift')){
                this.time2_type = 0;
            }else if (this.value?.[this.editing_i]?.time2 === false){
                this.time2_type = 1;
            }else if (this.isDefined(this.editing_i, 'time2_shift')){
                this.time2_type = 3;
            }else{
                this.time2_type = 2;
            }
            //Show Modal
            this.$refs.edit_modal.show();
        },
        removeModItem(index){
            var c = confirm('確定移除？');
            if (!c) return false;
            this.value.splice(index, 1);
            this.changed();
            this.$refs.edit_modal.hide();
        },
        newModItem(){
            var mod = prompt('請輸入mod名稱。');
            if (!mod) return false;
            for (var i in this.value){
                if (this.value[i].mod == mod) return false;
            }
            //Push
            if (!this.isCross){
                this.value.push({
                    mod: mod, track: null, is_express_track: null,
                    time1: null, time1_shift: null, time2: null, time2_shift: null, is_pass: null,
                });
            }else{
                this.value.push({
                    mod: mod, time1: null, time1_shift: null, time2: null, time2_shift: null,
                });
            }
            //Sort
            this.value.sort(function(a, b){
                if (a.mod > b.mod) return +1;
                if (a.mod < b.mod) return -1;
                return 0;
            });
            this.changed();
        },
        //
        showJSONModal(){
            this.json_edit = JSON.stringify(this.value);
            this.json_edit_error = null;
            this.$refs.json_modal.show();
        },
        JSONSubmit(){
            this.json_edit_error = null;
            try{
                var parsed = JSON.parse(this.json_edit);
            }catch(err){
                return this.json_edit_error = "Invalid JSON";
            }
            if (!Array.isArray(parsed)) return this.json_edit_error = "Not a valid array";
            for (var i in parsed){
                if (!parsed?.[i]?.mod) return this.json_edit_error = "Attribute 'mod' missing";
            }
            //Proceed
            this.value = parsed;
            this.changed();
            this.$forceUpdate();
            this.$refs.json_modal.hide();
        },
        //
        setTime1(time1, time1_shift){
            if (!this.value[this.editing_i]) return false;
            this.value[this.editing_i].time1 = time1;
            this.value[this.editing_i].time1_shift = time1_shift;
            this.$forceUpdate();
        },
        setTime2(time2, time2_shift){
            if (!this.value[this.editing_i]) return false;
            this.value[this.editing_i].time2 = time2;
            this.value[this.editing_i].time2_shift = time2_shift;
            this.$forceUpdate();
        },
    },
    computed: {
    },
}
</script>

<template>
    <div>
        <div v-for="(mod, i) in value" :key="i" @click="editModItem(i)">
            <!-- For each mod -------------------------------->
            <b-badge>{{mod.mod}}</b-badge>
            <ul class="my-list">
                <li v-if="isDefined(i, 'track')">
                    軌{{mod.track}}
                </li>
                <li v-if="isDefined(i, 'is_express_track')">
                    {{mod.is_express_track ? '快線' : '普線'}}
                </li>
                <li v-if="isDefined(i, 'is_pass')">
                    {{mod.is_pass ? '通過' : '停車'}}
                </li>
                <li v-if="isDefined(i, 'time1') || isDefined(i, 'time1_shift')">
                    <b-icon-clock />
                    <span v-if="mod.time1_shift">{{displayTimeInterval(mod.time1_shift, true)}}</span>
                    <span v-else-if="mod.time1 !== false">{{displayTime(mod.time1)}}</span>
                    <span v-else>N/A</span>
                </li>
                <li v-if="isDefined(i, 'time2') || isDefined(i, 'time2_shift')">
                    <b-icon-clock-fill />
                    <span v-if="mod.time2_shift">{{displayTimeInterval(mod.time2_shift, true)}}</span>
                    <span v-else-if="mod.time2 !== false">{{displayTime(mod.time2)}}</span>
                    <span v-else>N/A</span>
                </li>
            </ul>
            <span class="text-info">
                <b-icon-pencil />
            </span>
            <!------------------------------------------------>
        </div>
        <div class="mt-1">
            <b-button variant="link" size="sm" class="py-0 text-success" @click="newModItem()">
                <b-icon-plus-square />
            </b-button>
            <b-button variant="link" size="sm" class="py-0 text-info" @click="showJSONModal()">
                <b-icon-code-square />
            </b-button>
        </div>

        <!-- JSON Modal -->
        <b-modal ref="json_modal" size="md" title="JSON" hide-footer centered @hide="changed()">
            <b-form-textarea v-model="json_edit" rows="10" size="sm" @change="json_edit_error = null;" />
            <b-button variant="primary" block @click="JSONSubmit()">
                提交
            </b-button>
            <div class="text-center text-danger">{{json_edit_error}}</div>
        </b-modal>

        <!-- Edit Modal -->
        <b-modal ref="edit_modal" size="md" hide-header hide-footer centered @hide="changed()">
            <template v-if="value[editing_i]">
                <h5><b-badge>{{value[editing_i].mod}}</b-badge></h5>
                <div class="row" v-if="!isCross">
                    <div class="col-sm-6">
                        軌道/月台
                        <small>(預設: {{defaultValue.track}})</small>
                    </div>
                    <div class="col-sm-6">
                        <b-form-select size="sm" v-model="value[editing_i].track">
                            <b-form-select-option :value="null">[不設定]</b-form-select-option>
                            <b-form-select-option v-for="(track, i) in options_tracks" :key="i" :value="track">
                                {{track}}
                            </b-form-select-option>
                        </b-form-select>
                    </div>
                </div>
                <div class="row" v-if="!isCross">
                    <div class="col-sm-6">
                        線路
                        <small>(預設: {{defaultValue.is_express_track ? '快/急' : '慢/普'}})</small>
                    </div>
                    <div class="col-sm-6">
                        <b-form-select size="sm" v-model="value[editing_i].is_express_track">
                            <b-form-select-option :value="null">[不改動]</b-form-select-option>
                            <b-form-select-option :value="false">慢線/普通線</b-form-select-option>
                            <b-form-select-option :value="true">快線/急行線</b-form-select-option>
                        </b-form-select>
                    </div>
                </div>
                <div class="row" v-if="!isCross">
                    <div class="col-sm-6">
                        停車/通過
                        <small>(預設: {{defaultValue.is_pass ? '通過' : '停車'}})</small>
                    </div>
                    <div class="col-sm-6">
                        <b-form-select size="sm" v-model="value[editing_i].is_pass">
                            <b-form-select-option :value="null">[不改動]</b-form-select-option>
                            <b-form-select-option :value="false">停車</b-form-select-option>
                            <b-form-select-option :value="true">通過</b-form-select-option>
                        </b-form-select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6">
                        <span v-if="!isCross">到着時刻</span>
                        <span v-else>進入時刻</span>
                        <small>(預設: {{displayTime(defaultValue.time1)}})</small>
                    </div>
                    <div class="col-sm-6">
                        <input-time v-model="value[editing_i].time1" size="sm" v-if="time1_type == 2" />
                        <input-min-sec signed v-model="value[editing_i].time1_shift" size="sm" v-if="time1_type == 3" />
                    </div>
                    <div class="col-12 my-1 text-center">
                        <b-button size="sm" class="p-1" :variant="(time1_type != 0 ? 'outline-' : '')+'secondary'"
                        @click="setTime1(null, null); time1_type = 0;">
                            不改動
                        </b-button>
                        <b-button size="sm" class="p-1" :variant="(time1_type != 1 ? 'outline-' : '')+'secondary'"
                        @click="setTime1(false, null); time1_type = 1;">
                            N/A
                        </b-button>
                        <b-button size="sm" class="p-1" :variant="(time1_type != 2 ? 'outline-' : '')+'secondary'"
                        @click="setTime1(defaultValue.time1, null); time1_type = 2;">
                            絕對時刻
                        </b-button>
                        <b-button size="sm" class="p-1" :variant="(time1_type != 3 ? 'outline-' : '')+'secondary'"
                        @click="setTime1(null, 0); time1_type = 3;">
                            相對時刻
                        </b-button>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6">
                        <span v-if="!isCross">發車/通過時刻</span>
                        <span v-else>離出時刻</span>
                        <small>(預設: {{displayTime(defaultValue.time2)}})</small>
                    </div>
                    <div class="col-sm-6">
                        <input-time v-model="value[editing_i].time2" size="sm" v-if="time2_type == 2" />
                        <input-min-sec signed v-model="value[editing_i].time2_shift" size="sm" v-if="time2_type == 3" />
                    </div>
                    <div class="col-12 my-1 text-center">
                        <b-button size="sm" class="p-1" :variant="(time2_type != 0 ? 'outline-' : '')+'secondary'"
                        @click="setTime2(null, null); time2_type = 0;">
                            不改動
                        </b-button>
                        <b-button size="sm" class="p-1" :variant="(time2_type != 1 ? 'outline-' : '')+'secondary'"
                        @click="setTime2(false, null); time2_type = 1;">
                            N/A
                        </b-button>
                        <b-button size="sm" class="p-1" :variant="(time2_type != 2 ? 'outline-' : '')+'secondary'"
                        @click="setTime2(defaultValue.time2, null); time2_type = 2;">
                            絕對時刻
                        </b-button>
                        <b-button size="sm" class="p-1" :variant="(time2_type != 3 ? 'outline-' : '')+'secondary'"
                        @click="setTime2(null, 0); time2_type = 3;">
                            相對時刻
                        </b-button>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-6">
                        <b-button variant="primary" block @click="changed(); $refs.edit_modal.hide();">
                            提交
                        </b-button>
                    </div>
                    <div class="col-6">
                        <b-button variant="danger" block @click="removeModItem(editing_i)">
                            移除
                        </b-button>
                    </div>
                </div>
            </template>
        </b-modal>
    </div>
</template>


<style scoped>
.my-list{
    list-style-type: none;
    display: inline;
    padding-left: 0;
}
.my-list li{
    display: inline;
}
.my-list li + li::before {
    content: " | ";
    color: #ccc;
}

</style>