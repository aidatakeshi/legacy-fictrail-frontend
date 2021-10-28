<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPen, BIconX, BIconPlus } from 'bootstrap-vue'
import SelectStationInTemplate from './select-station-in-template.vue';

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconPlus,
        SelectStationInTemplate,
    },
    props: {
        value: Object,
        isNew: Boolean,
        isCopy: Boolean,
    },
    data() {
        return {
            editing_i: null,
            editing: {
                pivot_from: null, pivot_to: null, interval: null,
                station_begin: null, station_terminate: null,
                mods: null,
                service_no_min: null, service_no_step: null,
                wk: null, ph: null, is_temp: null,
            },
            editing_default: {
                interval: 900,
                mods: [],
                service_no_step: 2,
                wk: true, ph: true, is_temp: false,
            },
            show_wk: true,
            show_ph: true,
        };
    },
    watch: {

    },
    mounted(){

    },
    methods:{
        displayTime: $.displayTime,
        displayTimeInterval: $.displayTimeInterval,
        changed(){
            this.$emit('input', this.value);
        },

        //Get Number of Services of Item
        getNumberofServices(item){
            if (!item.interval || !item.pivot_to) return 1;
            return Math.floor((item.pivot_to - item.pivot_from)/item.interval) + 1;
        },

        //Edit Item Button
        editItem(i){
            this.editing_i = i;
            for (var attr in this.editing) this.editing[attr] = this.value.deployment[i]?.[attr];
            this.$refs._modal.show();
        },

        //New Item
        newItem(){
            this.editing_i = null;
            for (var attr in this.editing) this.editing[attr] = null;
            for (var attr in this.editing_default) this.editing[attr] = this.editing_default[attr];
            this.$refs._modal.show();
        },
        
        //Remove Item
        removeItem(i){
            if (!confirm('確認移除?')) return false;
            this.value.deployment.splice(i, 1);
            this.changed();
        },

        //Submit Item
        submitItem(){
            if (this.editing_i !== null){ //Edit
                this.value.deployment[this.editing_i] = Object.assign({}, this.editing);
            }else{ //New
                this.value.deployment.push(Object.assign({}, this.editing));
            }
            this.sortItems();
            this.$refs._modal.hide();
            this.changed();
        },

        //Sort Items
        sortItems(){
            this.value.deployment.sort(function (a, b){
                if (a.pivot_from < b.pivot_from) return -1;
                if (a.pivot_from > b.pivot_from) return +1;
                var a_score = (a.wk ? 2 : 0) + (a.ph ? 1 : 0);
                var b_score = (b.wk ? 2 : 0) + (b.ph ? 1 : 0);
                if (a_score > b_score) return -1;
                if (a_score < b_score) return +1;
                return 0;
            });
        },

    },
    computed: {

    },
}
</script>

<template>
    <div>
        <!-- Show Weekday / Holiday? -->
        <div class="mb-2">
            <b-button size="sm"
            :variant="((show_wk && show_ph) ? '' : 'outline-') + 'primary'"
            @click="show_wk = true; show_ph = true;">顯示全部</b-button>
            <b-button size="sm"
            :variant="((show_wk && !show_ph) ? '' : 'outline-') + 'success'"
            @click="show_wk = true; show_ph = false;">平日班次</b-button>
            <b-button size="sm"
            :variant="((!show_wk && show_ph) ? '' : 'outline-') + 'danger'"
            @click="show_wk = false; show_ph = true;">假日班次</b-button>
        </div>

        <!-- Existing Items -->
        <template v-for="(item, i) in value.deployment">
            <b-card :key="i" class="mb-2" v-if="(item.wk && show_wk) || (item.ph && show_ph)"
            body-class="p-1 d-flex align-items-center">
                <!-- Edit Button -->
                <b-button variant="link" class="p-0 mr-2 text-info" @click="editItem(i)">
                    <b-icon-pen scale="1" />
                </b-button>
                <!---------------------------->
                <div class="row w-100">
                    <!-- Pivot Time -->
                    <div class="col-lg-6">
                        <small>基準:</small>
                        <strong>{{displayTime(item.pivot_from, true)}}</strong>
                        <template v-if="getNumberofServices(item) > 1">
                            ~ <strong>{{displayTime(item.pivot_to, true)}}</strong>
                            @<strong>{{displayTimeInterval(item.interval)}}</strong>
                        </template>
                        <small>({{getNumberofServices(item)}}班)</small>
                        <template v-if="show_wk && show_ph">
                            <b-badge variant="primary" v-if="item.wk && item.ph">每日</b-badge>
                            <b-badge variant="success" v-else-if="item.wk">平日</b-badge>
                            <b-badge variant="danger" v-else-if="item.ph">假日</b-badge>
                        </template>
                        <b-badge variant="secondary" v-if="item.is_temp">臨時</b-badge>
                    </div>
                    <!-- Begin / Terminate -->
                    <div class="col-lg-6">
                        <template v-if="!item.station_begin && !item.station_terminate">
                            全程班次
                        </template>
                        <template v-else-if="item.station_begin && item.station_terminate">
                            <strong><name-station :id="item.station_begin" /></strong>
                            <small>開往</small>
                            <strong><name-station :id="item.station_terminate" /></strong>
                        </template>
                        <template v-else-if="item.station_begin">
                            <strong><name-station :id="item.station_begin" /></strong>
                            <small>起點</small>
                        </template>
                        <template v-else>
                            <small>終點</small>
                            <strong><name-station :id="item.station_terminate" /></strong>
                        </template>
                        <small v-if="item.service_no_min">
                            ({{item.service_no_min}}
                            <template v-if="getNumberofServices(item) > 1">
                                ~ {{item.service_no_min - item.service_no_step * (1 - getNumberofServices(item))}}
                            </template>
                            號)
                        </small>
                    </div>
                    <!-- Mods -->
                    <div class="col-lg-6" v-if="(item.mods||[]).length">
                        <small>固定mods: </small>
                        <b-badge v-for="(item, i) in item.mods" :key="i" class="mr-1">
                            {{item}}
                        </b-badge>
                    </div>
                </div>
                <!-- Remove Button -->
                <b-button variant="link" class="p-0 ml-2 text-danger" @click="removeItem(i)">
                    <b-icon-x scale="1.2" />
                </b-button>
                <!----------------------------------------------------------->
            </b-card>
        </template>

        <!-- New Button -->
        <b-button variant="link" class="p-0 ml-1 text-success" @click="newItem()">
            <b-icon-plus scale="1.2" />
        </b-button>

        <!-- Editing / New Modal -->
        <b-modal ref="_modal" :title="(editing_i === null) ? '新增' : '修改'" hide-footer centered>
            <div class="row">
                <div class="col-sm-4">營運日</div>
                <div class="col-sm-8">
                    <b-button size="sm" class="mx-0 my-1 px-1 py-0"
                    :variant="((editing.wk && editing.ph) ? '' : 'outline-') + 'primary'"
                    @click="editing.wk = true; editing.ph = true;">每日</b-button>
                    <b-button size="sm" class="mx-0 my- px-1 py-0"
                    :variant="((editing.wk && !editing.ph) ? '' : 'outline-') + 'success'"
                    @click="editing.wk = true; editing.ph = false;">平日</b-button>
                    <b-button size="sm" class="mx-0 my- px-1 py-0"
                    :variant="((!editing.wk && editing.ph) ? '' : 'outline-') + 'danger'"
                    @click="editing.wk = false; editing.ph = true;">假日</b-button>
                </div>
                <div class="col-sm-4">由</div>
                <div class="col-sm-8">
                    <input-time v-model="editing.pivot_from" size="sm" />
                </div>
                <div class="col-sm-4">至</div>
                <div class="col-sm-8">
                    <input-time v-model="editing.pivot_to" size="sm" />
                </div>
                <div class="col-sm-4">間隔</div>
                <div class="col-sm-8">
                    <input-min-sec v-model="editing.interval" size="sm" />
                </div>
            </div>
            <div class="mt-1 text-center">
                <b-button size="sm" variant="outline-secondary" class="m-0 px-1 py-0"
                @click="editing.interval = 300">5分</b-button>
                <b-button size="sm" variant="outline-secondary" class="m-0 px-1 py-0"
                @click="editing.interval = 600">10分</b-button>
                <b-button size="sm" variant="outline-secondary" class="m-0 px-1 py-0"
                @click="editing.interval = 900">15分</b-button>
                <b-button size="sm" variant="outline-secondary" class="m-0 px-1 py-0"
                @click="editing.interval = 1200">20分</b-button>
                <b-button size="sm" variant="outline-secondary" class="m-0 px-1 py-0"
                @click="editing.interval = 1800">30分</b-button>
                <b-button size="sm" variant="outline-secondary" class="m-0 px-1 py-0"
                @click="editing.interval = 3600">1粒</b-button>
                <b-button size="sm" variant="outline-secondary" class="m-0 px-1 py-0"
                @click="editing.interval = 7200">2粒</b-button>
                <b-button size="sm" variant="outline-info" class="m-0 px-1 py-0"
                @click="editing.pivot_to = editing.pivot_from">只有一班</b-button>
            </div>
            <hr class="my-1" />
            <div class="row">
                <div class="col-sm-4">起點</div>
                <div class="col-sm-8">
                    <select-station-in-template v-model="editing.station_begin"
                    :sch-template="value.sch_template" nullable
                    placeholder="-- 此模板最頭車站 --" size="sm" />
                </div>
                <div class="col-sm-4">終點</div>
                <div class="col-sm-8">
                    <select-station-in-template v-model="editing.station_terminate"
                    :sch-template="value.sch_template" nullable
                    placeholder="-- 此模板最尾車站 --" size="sm" />
                </div>
                <div class="col-sm-4">固定mods</div>
                <div class="col-sm-8">
                    <b-form-tags v-model="editing.mods" size="sm" />
                </div>
                <div class="col-sm-4">服務編號起始*</div>
                <div class="col-sm-8">
                    <b-form-input type="number" v-model="editing.service_no_min" size="sm" />
                </div>
                <div class="col-sm-4">服務編號步驟*</div>
                <div class="col-sm-8">
                    <b-form-input type="number" v-model="editing.service_no_step" size="sm" />
                </div>
                <div class="col-sm-4">臨時列車</div>
                <div class="col-sm-8">
                    <b-form-checkbox switch v-model="editing.is_temp" />
                </div>
            </div>
            <small>* 適用於有對號座列車，「起始」指最先開出班次的服務編號；「步驟」指下一班車跳上的服務編號。</small>
            <!-- Submit -->
            <hr class="my-1" />
            <div class="text-center mt-2">
                <b-button variant="primary" style="width: 100%; max-width: 15rem;" @click="submitItem"
                :disabled="!editing.pivot_from || !editing.pivot_to || !editing.interval"
                >提交</b-button>
            </div>
        </b-modal>
        
    </div>
</template>