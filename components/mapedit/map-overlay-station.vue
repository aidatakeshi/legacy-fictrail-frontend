<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const config = require('~/mapedit-config.js');
const calc = require('~/mapedit-calc.js');

import {
    BIcon, BIconPlus, BIconPen, BIconEye, BIconEyeSlash, BIconLock, BIconUnlock,
    BIconChevronUp, BIconChevronDown, BIconChevronLeft, BIconChevronRight,
} from 'bootstrap-vue'

export default {
    
    components: {
        BIcon, BIconPlus, BIconPen, BIconEye, BIconEyeSlash, BIconLock, BIconUnlock,
        BIconChevronUp, BIconChevronDown, BIconChevronLeft, BIconChevronRight,
    },
    props: {
        station: Object,
        isNew: Boolean,
        trigger: Number,
        chooseStationX: Number,
        chooseStationY: Number,
    },

    data() {
        return {
            edit: {
                id: null,
                x: null, y: null, height_m: null,
                name_chi: null, name_eng: null,
                operator_id: null, prefecture_id: null,
                major: null, tracks: null,
                is_signal_only: null, is_abandoned: null,
                remarks: null,
            },
            new_default: {
                major: false, is_signal_only: false, is_abandoned: false,
                tracks: ['1','2'],
            },
            isAPIProcessing: false,
        };
    },

    watch: {
        trigger(){
            this.init();
        },
        chooseStationX(val){
            if (val !== null & val !== undefined) this.edit.x = val;
        },
        chooseStationY(val){
            if (val !== null & val !== undefined) this.edit.y = val;
        },
    },

    mounted(){
        this.init();
    },

    methods: {
        init(){
            if (!this.isNew){
                for (var i in this.station) this.edit[i] = this.station?.[i];
            }else{
                for (var i in this.edit) this.edit[i] = null;
                for (var i in this.new_default) this.edit[i] = this.new_default[i];
            }
            this.$forceUpdate();
        },
        getLatLonDisplay(x, y){
            if (!isFinite(x) || !isFinite(y)) return '-';
            var ll = calc.getLatLonFromXY(x, y);
            return ll.lat.toFixed(6) + '°N ,' + ll.lon.toFixed(6) + '°E';
        },
        decimals(val, digits){
            if (!isFinite(val) || val === null) return '-';
            return parseFloat(val).toFixed(digits);
        },
        async submitStation(){
            if (this.isAPIProcessing) return false;
            if (!this.edit.x || !this.edit.y) return false;
            //Call API
            if (!this.isNew){
                var response = await $.callAPI(axios, 'PATCH', `items/stations/${this.edit.id}`, this.edit);
            }else{
                this.isAPIProcessing = true;
                var response = await $.callAPI(axios, 'POST', `items/stations`, this.edit);
                this.edit.id = response?.data?.id;
                this.isAPIProcessing = false;
            }
            //Proceed...
            if (response.http_status >= 400){
                return this.$bvToast.toast('提交失敗', { title: '車站', variant: 'danger' });
            }
            this.$emit('close');
            this.$emit('station-updated', this.edit);
        },
        async removeStation(){
            if(!confirm("確定移除？")) return false;
            //Call API
            var response = await $.callAPI(axios, 'DELETE', `items/stations/${this.edit.id}`);
            //Proceed...
            if (response.http_status >= 400){
                return this.$bvToast.toast('移除失敗', { title: '車站', variant: 'danger' });
            }
            this.$emit('close');
            this.$emit('station-removed', this.edit);
        },
    },

    computed: {

    },
}

</script>

<template>
    <div class="map-overlay">

        <div class="mb-2">
            <b-button variant="secondary" @click="$emit('close')">
                <b-icon-chevron-left />取消選取
            </b-button>
        </div>
        <h1 v-if="!isNew">編輯車站</h1>
        <h1 v-else>新增車站</h1>

        <!-- Position -->
        <div v-if="!isNew">
            <strong>ID: <span style="font-size: 80%">{{edit.id}}</span></strong>
        </div>
        <div v-if="edit.x && edit.y">
            <strong>x: {{decimals(edit.x, 3)}} y: {{decimals(edit.y, 3)}}</strong>
        </div>
        <div v-if="edit.x && edit.y">
            <strong>[{{getLatLonDisplay(edit.x, edit.y)}}]</strong>
        </div>
        <hr class="my-2" />

        <!-- Edit Fields -->
        <div class="map-stationde-edit">
            <div class="label"><strong>車站名稱</strong></div>
            <div class="input">
                <b-form-input type="text" v-model="edit.name_chi" />
            </div>
        </div>
        <div class="map-stationde-edit">
            <div class="label"><strong>Station Name</strong></div>
            <div class="input">
                <b-form-input type="text" v-model="edit.name_eng" />
            </div>
        </div>
        <div class="map-stationde-edit">
            <div class="label"><strong>主要營運者</strong></div>
            <div class="input">
                <select-item type="operator" v-model="edit.operator_id" remember />
            </div>
        </div>
        <div class="map-stationde-edit">
            <div class="label"><strong>所在都省府縣</strong></div>
            <div class="input">
                <select-item type="prefecture" v-model="edit.prefecture_id" remember />
            </div>
        </div>
        <div class="map-stationde-edit">
            <div class="label"><strong>主要車站</strong></div>
            <div class="input">
                <b-form-checkbox v-model="edit.major" switch />
            </div>
        </div>
        <div class="map-stationde-edit">
            <div class="label"><strong>海拔 (m)</strong></div>
            <div class="input">
                <b-form-input type="number" v-model="edit.height_m" />
            </div>
        </div>
        <div>
            <strong>月台/軌道編號</strong>
            <input-track-number v-model="edit.tracks" />
        </div>
        <div class="map-stationde-edit">
            <div class="label"><strong>信號站</strong></div>
            <div class="input">
                <b-form-checkbox v-model="edit.is_signal_only" switch />
            </div>
        </div>
        <div class="map-stationde-edit">
            <div class="label"><strong>廢止站</strong></div>
            <div class="input">
                <b-form-checkbox v-model="edit.is_abandoned" switch />
            </div>
        </div>
        <div>
            <strong>備註</strong>
            <b-form-textarea rows="5" v-model="edit.remarks" />
        </div>
        <div class="mt-2">
            <b-button variant="primary" block @click="submitStation()">提交</b-button>
        </div>
        <div class="mt-2" v-if="!isNew">
            <b-button variant="danger" block @click="removeStation()">移除車站</b-button>
        </div>

    </div>
</template>