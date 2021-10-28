<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import {
    BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconArrowUp, BIconArrowDown, BIconShuffle,
} from 'bootstrap-vue'

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconArrowUp, BIconArrowDown, BIconShuffle,
    },
    props: {
        schTemplate: Array,
        index: Number,
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
    },
    computed: {
        isFirstStation(){
            for (var i = this.index - 1; i >= 0; i--){
                if (!this.schTemplate[i].cross_id) return false;
            }
            return true;
        },
        isLastStation(){
            for (var i = this.index + 1; i < this.schTemplate.length; i++){
                if (!this.schTemplate[i].cross_id) return false;
            }
            return true;
        },
        thisLineID(){
            return (this.schTemplate[this.index]||{}).line_id;
        },
        prevLineID(){
            for (var i = this.index - 1; i >= 0; i--){
                if (!this.schTemplate[i].cross_id){
                    return (this.schTemplate[i]||{}).line_id;
                }
            }
        },
        isStationDeletable(){
            if (this.isFirstStation) return true;
            if (this.isLastStation) return true;
            if (this.thisLineID != this.prevLineID) return false;
            return true;
        },
    },
}
</script>

<template>
    <div>
        <h5><name-station :id="(schTemplate[index]||{}).station_id" /></h5>

        <b-button block variant="outline-success" size="sm" @click="$emit('menu', index, 'extend-station', true)"
        v-if="isFirstStation">
            <b-icon-arrow-up /> 增加區間 / 車站 (在上方)
        </b-button>
        <b-button block variant="outline-success" size="sm" @click="$emit('menu',  index, 'extend-station', false)"
        v-if="isLastStation">
            <b-icon-arrow-down /> 增加區間 / 車站 (在下方)
        </b-button>
        <b-button block variant="outline-info" size="sm" @click="$emit('menu',  index, 'insert-station')"
        v-if="!isLastStation">
            <b-icon-plus /> 插入中間車站 (在下方)
        </b-button>
        <b-button block variant="outline-danger" size="sm" @click="$emit('menu',  index, 'remove-station')"
        v-if="isStationDeletable">
            <b-icon-x scale="1.5" /> 移除車站
        </b-button>
        <b-button block variant="outline-secondary" size="sm" @click="$emit('menu',  index, 'add-crossing', true)"
        v-if="!isFirstStation">
            <b-icon-shuffle /> 增加軌道相交點 (在上方)
        </b-button>
        <b-button block variant="outline-secondary" size="sm" @click="$emit('menu',  index, 'add-crossing', false)"
        v-if="!isLastStation">
            <b-icon-shuffle /> 增加軌道相交點 (在下方)
        </b-button>
    </div>
</template>