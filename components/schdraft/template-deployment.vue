<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const sd = require('~/schdraft.js');
const smod = require('~/schdraft-mods.js');

import InputTime from './input-time.vue';
import InputMinSec from './input-min-sec.vue';
import InputScheduleStation from './input-schedule-station.vue';
import { BIcon, BIconPencil, BIconPlus, BIconTrash, BIconX } from 'bootstrap-vue'
import ShowItemAttr from '../show-item-attr.vue';

export default {

    components: {
        BIcon, BIconPencil, BIconPlus, BIconTrash, BIconX,
        InputTime, InputMinSec, InputScheduleStation,
        ShowItemAttr,
    },
    
    props: {
        value: null,
        schedule: Array,
        trigger: null,
    },

    data() {
        return {
            value$: null,
            editing_i: null,
            editing: {
                pivot_from: null, pivot_to: null, interval: null,
                begin: null, terminate: null,
                mods: null,
                service_no_min: null, service_no_step: null,
            },
            editing_default: {
                interval: 900,
                mods: [],
                service_no_step: 2,
            },
        };
    },

    watch: {
        value(){
            this.loadData();
        },
        trigger(){
            this.loadData();
        },
    },

    async mounted(){
        this.loadData();
    },

    methods: {
        displayTime: sd.displayTime,
        displayTimeInterval: sd.displayTimeInterval,

        loadData(){
            this.value$ = this.value;
        },
        update(){
            this.$emit('update');
            this.$emit('input', this.value$);
            this.$forceUpdate();
        },

        //Edit Item Button
        editItem(i){
            this.editing_i = i;
            for (var attr in this.editing) this.editing[attr] = this.value$[i]?.[attr];
            this.$refs._modal.show();
        },

        //New Item
        newItem(){
            this.editing_i = null;
            for (var attr in this.editing) this.editing[attr] = null;
            for (var attr in this.editing_default) this.editing[attr] = this.editing_default[attr];
            this.$refs._modal.show();
        },
        
        //Submit Item
        submitItem(){
            if (this.editing_i !== null){ //Edit
                this.value$[this.editing_i] = Object.assign({}, this.editing);
            }else{ //New
                this.value$.push(Object.assign({}, this.editing));
            }
            this.value$.sort(function (a, b){
                if (a.pivot_from < b.pivot_from) return -1;
                return 1;
            });
            this.$refs._modal.hide();
            this.update();
        },

        //Remove Item
        removeItem(){
            if (!confirm('確認移除?')) return false;
            this.value$.splice(this.editing_i, 1);
            this.update();
        },

        //Get Number of Services of Item
        getNumberofServices(item){
            return Math.floor((item.pivot_to - item.pivot_from)/item.interval) + 1;
        },
    },

}

</script>

<template>
    <div>
        <!-- Existing Items -->
        <div v-for="(item, i) in value$" :key="i">
            <div class="d-flex align-items-center">
                <div class="mr-auto">
                    <strong>{{displayTime(item.pivot_from, null, true)}}</strong>
                    <template v-if="getNumberofServices(item) > 1">
                        ~ <strong>{{displayTime(item.pivot_to, null, true)}}</strong>
                        @<strong>{{displayTimeInterval(item.interval)}}</strong>
                    </template>
                    <small>({{getNumberofServices(item)}}班)</small>

                    <br/>

                    <template v-if="!item.begin && !item.terminate">
                        全程班次
                    </template>
                    <template v-else-if="item.begin && item.terminate">
                        <show-item-attr type="stations" :id="item.begin" />
                        <small>開往</small>
                        <show-item-attr type="stations" :id="item.terminate" />
                    </template>
                    <template v-else-if="item.begin">
                        <show-item-attr type="stations" :id="item.begin" />
                        <small>起點</small>
                    </template>
                    <template v-else>
                        <small>終點</small>
                        <show-item-attr type="stations" :id="item.terminate" />
                    </template>

                    <small v-if="item.service_no_min">
                        ({{item.service_no_min}}
                        <template v-if="getNumberofServices(item) > 1">
                            ~ {{item.service_no_min - item.service_no_step * (1 - getNumberofServices(item))}}
                        </template>
                        號)
                    </small>
                </div>
                <div>
                    <b-button variant="link" class="p-0 text-info" @click="editItem(i)">
                        <b-icon-pencil scale="1" />
                    </b-button>
                    <b-button variant="link" class="p-0 text-danger" @click="removeItem(i)">
                        <b-icon-x scale="1.2" />
                    </b-button>
                </div>
            </div>
            <hr class="my-0" />
        </div>

        <!-- New Button -->
        <b-button variant="link" class="p-0 ml-1 text-success" @click="newItem">
            <b-icon-plus scale="1.2" />
        </b-button>

        <!-- Editing / New Modal -->
        <b-modal ref="_modal" :title="(editing_i === null) ? '新增' : '修改'" hide-footer centered>
            <div class="row">
                <div class="col-sm-4">由</div>
                <div class="col-sm-8">
                    <input-time v-model="editing.pivot_from" original-class />
                </div>
                <div class="col-sm-4">至</div>
                <div class="col-sm-8">
                    <input-time v-model="editing.pivot_to" original-class />
                </div>
                <div class="col-sm-4">間隔</div>
                <div class="col-sm-8">
                    <input-min-sec v-model="editing.interval" original-class />
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
                    <input-schedule-station v-model="editing.begin" :schedule="schedule"
                    placeholder="-- 此模板最頭車站 --" />
                </div>
                <div class="col-sm-4">終點</div>
                <div class="col-sm-8">
                    <input-schedule-station v-model="editing.terminate" :schedule="schedule"
                    placeholder="-- 此模板最尾車站 --" />
                </div>
                <div class="col-sm-4">固定mods</div>
                <div class="col-sm-8">
                    <b-form-tags v-model="editing.mods" />
                </div>
                <div class="col-sm-4">服務編號起始*</div>
                <div class="col-sm-8">
                    <b-form-input type="number" v-model="editing.service_no_min" />
                </div>
                <div class="col-sm-4">服務編號步驟*</div>
                <div class="col-sm-8">
                    <b-form-input type="number" v-model="editing.service_no_step" />
                </div>
            </div>
            <small>* 適用於有對號座列車，「起始」指最先開出班次的服務編號；「步驟」指下一班車跳上的服務編號。</small>
            <!-- Submit -->
            <hr class="my-1" />
            <div class="text-center mt-2">
                <b-button variant="primary" style="width: 100%; max-width: 15rem;" @click="submitItem"
                :disabled="!editing.pivot_from || !editing.pivot_to || editing.interval <= 0"
                >提交</b-button>
            </div>
        </b-modal>
        
        <!--------------------------------------------------------------->
    </div>
</template>