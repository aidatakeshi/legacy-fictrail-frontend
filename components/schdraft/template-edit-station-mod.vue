<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPencilSquare, BIconPlusSquare, BIconGripVertical, BIconXSquare } from 'bootstrap-vue'
import SelectStationInTemplate from './select-station-in-template.vue';

export default {
    components:{
        BIcon, BIconPencilSquare, BIconPlusSquare, BIconGripVertical, BIconXSquare,
        SelectStationInTemplate,
    },
    props: {
        value: Array,
        schTemplate: Array,
        header: String,
        isBegin: Boolean,
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
        //Remove Item
        removeItem(index){
            var c = confirm('確定移除？');
            if (!c) return false;
            this.value.splice(index, 1);
            this.changed();
        },
        //New Item
        newItem(){
            var mod = prompt('請輸入mod名稱。');
            if (!mod) return false;
            for (var i in this.value){
                if (this.value[i].mod == mod) return false;
            }
            //Insert
            this.value.push({mod: mod, station_id: null, is_reverse: false});
            //Sort
            this.value.sort(function (a, b){
                if (a.mod < b.mod) return -1;
                if (a.mod > b.mod) return +1;
                return 0;
            })
            this.changed();
        },

    },
    computed: {
        headerText(){
            return this.isBegin ? '縮短起點站' : '縮短終點站';
        },
    },
}
</script>

<template>
    <b-card body-class="p-1">
        <!-- Header & Edit Button -->
        <div>
            <strong>{{headerText}}</strong>
            <b-button variant="link" class="p-0 text-primary" @click="$refs._modal.show()">
                <b-icon-pencil-square />
            </b-button>
        </div>
        <!-- Display -->
        <div v-if="!(value||[]).length">未有設定</div>
        <div v-else>
            <div v-for="(item, i) in value" :key="i">
                <b-badge>{{item.mod}}</b-badge>
                <name-station :id="item.station_id" />
                <small v-if="item.is_reverse">(R)</small>
            </div>
        </div>
        <!-- Modal -->
        <b-modal ref="_modal" :title="header" hide-footer centered>
            <div v-if="!(value||[]).length">未有設定</div>
            <b-card body-class="p-1" v-for="(item, i) in value" :key="i">
                <div class="row">
                    <div class="col-md-6">
                        <b-button variant="link" class="p-0 text-danger" @click="removeItem(i)">
                            <b-icon-x-square />
                        </b-button>
                        <b-badge>{{item.mod}}</b-badge>
                    </div>
                    <div class="col-md-6">
                        <select-station-in-template v-model="item.station_id" size="sm" :sch-template="schTemplate" />
                    </div>
                </div>
                <div class="text-center">
                    <b-form-checkbox switch v-model="item.is_reverse" size="sm">
                        <span v-if="isBegin">如此車站出現兩次，選擇較後者</span>
                        <span v-else>如此車站出現兩次，選擇較前者</span>
                    </b-form-checkbox>
                </div>
            </b-card>
            <div>
                <b-button variant="link" class="p-0 text-success" @click="newItem()">
                    <b-icon-plus-square />
                </b-button>
            </div>
        </b-modal>

    </b-card>
</template>