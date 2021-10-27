<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPen, BIconX } from 'bootstrap-vue'
import InputTrainTypeMod from './input-train-type-mod.vue';
import InputTrainNameMod from './input-train-name-mod.vue';
import InputOperatorMod from './input-operator-mod.vue';

export default {
    components:{
        BIcon, BIconPen, BIconX,
        InputTrainTypeMod, InputTrainNameMod, InputOperatorMod,
    },
    props: {
        value: Object,
        isNew: Boolean,
        isCopy: Boolean,
    },
    data() {
        return {

        };
    },
    watch: {

    },
    mounted(){

    },
    methods:{
        changed(){
            this.$emit('input', this.value);
        },
    },
    computed: {

    },
}
</script>

<template>
    <div class="row" style="max-width: 40rem; margin: 0 auto;">
        <div class="col-sm-6"><strong>模板名稱</strong></div>
        <div class="col-sm-6">
            <b-form-input v-model="value.title" size="sm" @input="changed" />
        </div>
        <div class="col-sm-6"><strong>營運者 (預設)</strong></div>
        <div class="col-sm-6">
            <select-item type="operator" v-model="value.operator_id" size="sm" @input="changed" />
        </div>
        <div class="col-sm-6"><strong>營運者 (mod)</strong></div>
        <div class="col-sm-6">
            <input-operator-mod v-model="value.operator_id_mod" @input="changed" />
        </div>
        <div class="col-sm-6"><strong>列車種別 (預設)</strong></div>
        <div class="col-sm-6">
            <select-item type="train_type" v-model="value.train_type_id" size="sm" @input="changed" />
        </div>
        <div class="col-sm-6"><strong>列車種別 (mod)</strong></div>
        <div class="col-sm-6">
            <input-train-type-mod v-model="value.train_type_mod" @input="changed" />
        </div>
        <div class="col-sm-6"><strong>列車名稱 (預設)</strong></div>
        <div class="col-sm-6">
            <select-item type="train_name" v-model="value.train_name_id" nullable size="sm" @input="changed" />
        </div>
        <div class="col-sm-6"><strong>列車名稱 (mod)</strong></div>
        <div class="col-sm-6">
            <input-train-name-mod v-model="value.train_name_mod" @input="changed" />
        </div>
        <div class="col-sm-6"><strong>性能設定</strong></div>
        <div class="col-sm-6">
            <select-item type="vehicle_performance_item" v-model="value.vehicle_performance_id" size="sm" @input="changed" />
        </div>
        <div class="col-sm-6"><strong>方向</strong></div>
        <div class="col-sm-6 py-1">
            <b-form-radio-group v-model="value.is_upbound" size="sm" @input="changed">
                <b-form-radio :value="true">上行</b-form-radio>
                <b-form-radio :value="false">下行</b-form-radio>
            </b-form-radio-group>
        </div>
        <div class="col-sm-6"><strong>基準時間</strong></div>
        <div class="col-sm-6">
            <input-time v-model="value.pivot_time" size="sm" @input="changed" />
        </div>
        <div class="col-sm-6"><strong>排序時間調整</strong></div>
        <div class="col-sm-6">
            <input-number-signed v-model="value.pivot_time_adj" size="sm" @input="changed" />
        </div>
        <div class="col-sm-6"><strong>啟用模板？</strong></div>
        <div class="col-sm-6 py-1">
            <b-form-checkbox switch v-model="value.is_enabled" size="sm" @input="changed" />
        </div>
        <div class="col-sm-12">
            <strong>備註</strong>
            <b-form-textarea v-model="value.remarks" size="sm" rows="5" @input="changed" />
        </div>
        <div v-if="!isNew && !isCopy">
            <small>ID: {{value.id}}</small>
        </div>
    </div>
</template>