<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck } from 'bootstrap-vue'
import SelectStationInTemplate from './select-station-in-template.vue';
import InputMinSec from '../input-min-sec.vue';

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck,
        SelectStationInTemplate,
        InputMinSec,
    },
    props: {
        value: Array,
    },
    data() {
        return {
            station_from: null,
            station_to: null,
            shift: 0,
        };
    },
    watch: {

    },
    mounted(){

    },
    methods:{
        show(){
            var last = (this.value?.length || 0) - 1;
            this.station_from = this.value?.[0]?.station_id;
            this.station_to = this.value?.[last]?.station_id;
            this.shift = 0;
            this.$refs._modal.show();
        },
        submit(){
            //Determine start_index
            var start_index = null;
            for (var i = 0; i < this.value.length; i++){
                if (!this.value[i].is_cross){
                    if (this.value[i].station_id == this.station_from){
                        start_index = i;
                        break;
                    }
                }
            }
            //Determine end_index
            var end_index = null;
            for (var i = this.value.length - 1; i >= 0; i--){
                if (!this.value[i].is_cross){
                    if (this.value[i].station_id == this.station_to){
                        end_index = i;
                        break;
                    }
                }
            }
            //Validation
            if (start_index === null) return false;
            if (end_index === null) return false;
            if (start_index >= end_index) return false;
            if (this.shift === null || !isFinite(this.shift)) return false;
            //Proceed
            for (var i = start_index; i <= end_index; i++){
                if (i > start_index && this.value[i].time1){
                    this.value[i].time1 += this.shift;
                }
                if (i < end_index && this.value[i].time2){
                    this.value[i].time2 += this.shift;
                }
                for (var j in this.value[i].mod){
                    if (i > start_index && this.value[i].mod[j].time1){
                        this.value[i].mod[j].time1 += this.shift;
                    }
                    if (i < end_index && this.value[i].mod[j].time2){
                        this.value[i].mod[j].time2 += this.shift;
                    }
                }
            }
            //Finish
            this.$emit('input', this.value);
            this.$refs._modal.hide();
        },
    },
    computed: {
    },
}
</script>

<template>
    <div>
        <b-modal ref="_modal" title="推前/推後時間" size="md" hide-footer centered>
            <div class="row">
                <div class="col-md-6">由</div>
                <div class="col-md-6">
                    <select-station-in-template v-model="station_from" :sch-template="value" size="sm" />
                </div>
                <div class="col-md-6">至</div>
                <div class="col-md-6">
                    <select-station-in-template v-model="station_to" :sch-template="value" size="sm" />
                </div>
                <div class="col-md-6">調前/調後</div>
                <div class="col-md-6">
                    <input-min-sec signed v-model="shift" size="sm" />
                </div>
            </div>
            <div class="mt-2">
                <b-button variant="primary" block @click="submit">
                    提交
                </b-button>
            </div>
        </b-modal>
    </div>
</template>