<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck } from 'bootstrap-vue'

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck,
    },
    props: {

    },
    data() {
        return {
            station_name_search: null,
            search_result: [],
            result_count: 0,
        };
    },
    watch: {

    },
    mounted(){

    },
    methods:{
        async searchStations(){
            this.result_count = 0;
            if (!this.station_name_search){
                return this.search_result = [];
            }
            var response = await $.callAPI(axios, 'GET', 'items/station?limit=20&from_selecter=1&more=1', {
                name: this.station_name_search,
            });
            if (response.http_status != 200) this.search_result = [];
            this.search_result = response.data;
            this.result_count = response.count;
        }
    },
    computed: {
    },
}
</script>

<template>
    <b-card>

        <div>選擇第一個車站：</div>

        <b-form-input placeholder="輸入車站名稱" size="sm"
        v-model="station_name_search" @change="searchStations" />

        <div class="row" v-if="result_count">
            <div class="col-lg-6 d-flex" v-for="(item, i) in search_result" :key="i">
                <div class="mr-auto">
                    <strong>{{item.name_chi}}</strong>
                    <small>({{item.prefecture.name_chi}}{{item.prefecture.name_chi_suffix}})</small>
                </div>
                <b-button variant="outline-primary" size="sm" @click="$emit('selected', item.id)">
                    <b-icon-Check scale="1.5" />
                </b-button>
            </div>
        </div>

        <div v-if="result_count >= 20">*只顯示頭20個結果</div>
        
    </b-card>
</template>