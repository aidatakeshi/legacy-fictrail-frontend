<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPlus, BIconX } from 'bootstrap-vue'
import SelectItem from '@/components/select-item';

export default {
    components:{
        BIcon, BIconPlus, BIconX,
        SelectItem,
    },
    props: {
        value: Array,
    },
    data() {
        return {
            data_operators: {},
            new_value: null,
        };
    },
    watch: {

    },
    async mounted(){
        var response = await $.callAPI(axios, 'GET', 'items/operators?from_selecter=1&obj=1');
        if (response.http_status >= 400) return false;
        this.data_operators = response.data;
    },
    methods:{
        changed(){
            this.$emit('input', this.value);
        },
        remove(i){
            this.value.splice(i, 1);
            this.changed();
        },
        add(){
            if (!this.new_value) return false;
            var mod = prompt('請輸入mod名稱。');
            if (!mod) return false;
            for (var i in this.value){
                if (mod == this.value[i].mod) return false;
            }
            this.value.push({mod: mod, value: this.new_value});
            this.new_value = null;
            //Do Sort
            this.value.sort((a, b) => (a.mod > b.mod ? 1 : -1));
            this.changed();
        },
    },
    computed: {

    },
}
</script>

<template>
    <div v-if="value">
        <b-card body-class="p-1" @click="$refs._modal.show()">
            <div class="text-center small" v-if="!Object.keys(value).length">未有設定</div>
            <div v-for="(item, i) in value" :key="i">
                <b-badge>{{item.mod}}</b-badge>
                <span class="small">{{(data_operators[item.value]||{}).name_chi}}</span>
            </div>
        </b-card>
        <!-- Edit Modal -->
        <b-modal ref="_modal" hide-header hide-footer centered>
            <div class="row" v-for="(item, i) in value" :key="i">
                <div class="col-6">
                    <b-button variant="outline-danger" size="sm" class="px-1 py-0" @click="remove(i)">
                        <b-icon-x size="1.5" />
                    </b-button>
                    <b-badge>{{item.mod}}</b-badge>
                </div>
                <div class="col-6">
                    <select-item type="operator" v-model="value[i].value" size="sm" @input="changed()" />
                </div>
            </div>
            <div class="row">
                <div class="col-6">
                    增加
                </div>
                <div class="col-6">
                    <select-item type="operator" v-model="new_value" size="sm" @change="add()" />
                </div>
            </div>
        </b-modal>
    </div>
</template>

<style scoped>
    .small{
        font-size: 80%;
    }
</style>