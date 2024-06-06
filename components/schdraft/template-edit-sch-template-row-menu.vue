<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import {
    BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconArrowUp, BIconArrowDown, BIconShuffle,
} from 'bootstrap-vue'

import InputTime from '@/components/input-time';
import InputMinSec from '@/components/input-min-sec';
import NameStation from '@/components/name-station';

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconArrowUp, BIconArrowDown, BIconShuffle,
        InputTime, InputMinSec, NameStation,
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
        station_id(){
            return (this.schTemplate[this.index]||{}).station_id;
        },
        station_id_prev(){
            return (this.schTemplate[this.index - 1]||{}).station_id;
        },
        station_id_next(){
            return (this.schTemplate[this.index + 1]||{}).station_id;
        },
        isCrossing(){
            return (this.schTemplate[this.index]||{}).is_cross;
        },
        isFirstStation(){
            for (var i = this.index - 1; i >= 0; i--){
                if (!this.schTemplate[i].is_cross) return false;
            }
            return true;
        },
        isLastStation(){
            for (var i = this.index + 1; i < this.schTemplate.length; i++){
                if (!this.schTemplate[i].is_cross) return false;
            }
            return true;
        },
        thisLineID(){
            return (this.schTemplate[this.index]||{}).line_id;
        },
        prevLineID(){
            for (var i = this.index - 1; i >= 0; i--){
                if (!this.schTemplate[i].is_cross){
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
        isCrossingMovableUp(){
            return this.station_id_prev == this.station_id;
        },
        isCrossingMovableDown(){
            return this.station_id_next == this.station_id;
        },
    },
}
</script>

<template>
    <div>
        <h5>
            <name-station :id="station_id" />
            <small v-if="isCrossing" class="text-secondary">
                <b-icon-shuffle /> <b-badge>{{(schTemplate[index]||{}).cross_id}}</b-badge>
            </small>
        </h5>

        <!-- Station -->
        <div v-if="!isCrossing">
            <b-button block variant="outline-success" @click="$emit('menu', index, 'extend-station', true)"
            v-if="isFirstStation" size="sm">
                <b-icon-arrow-up /> 增加區間 / 車站 (在上方)
            </b-button>
            <b-button block variant="outline-success" @click="$emit('menu',  index, 'extend-station', false)"
            v-if="isLastStation" size="sm">
                <b-icon-arrow-down /> 增加區間 / 車站 (在下方)
            </b-button>
            <b-button block variant="outline-info" @click="$emit('menu',  index, 'insert-station')"
            v-if="!isLastStation" size="sm">
                <b-icon-plus /> 插入中間車站 (在下方)
            </b-button>
            <b-button block variant="outline-danger" @click="$emit('menu',  index, 'remove-station')"
            v-if="isStationDeletable" size="sm">
                <b-icon-x scale="1.5" /> 移除車站
            </b-button>
            <b-button block variant="outline-secondary" @click="$emit('menu',  index, 'add-crossing', true)"
            v-if="!isFirstStation" size="sm">
                <b-icon-shuffle /> 增加軌道相交點 (在上方)
            </b-button>
            <b-button block variant="outline-secondary" @click="$emit('menu',  index, 'add-crossing', false)"
            v-if="!isLastStation" size="sm">
                <b-icon-shuffle /> 增加軌道相交點 (在下方)
            </b-button>
        </div>

        <!-- Crossing -->
        <div v-else>
            <b-button block variant="outline-danger" @click="$emit('menu',  index, 'remove-crossing')"
            v-if="true" size="sm">
                <b-icon-x scale="1.5" /> 移除相交點
            </b-button>
            <b-button block variant="outline-primary" @click="$emit('menu',  index, 'move-crossing', true)"
            v-if="isCrossingMovableUp" size="sm">
                <b-icon-arrow-up /> 移往上方
            </b-button>
            <b-button block variant="outline-primary" @click="$emit('menu',  index, 'move-crossing', false)"
            v-if="isCrossingMovableDown" size="sm">
                <b-icon-arrow-down /> 移往下方
            </b-button>
            <b-button block variant="outline-secondary" @click="$emit('menu',  index, 'add-crossing', true)"
            v-if="true" size="sm">
                <b-icon-shuffle /> 增加軌道相交點 (在上方)
            </b-button>
            <b-button block variant="outline-secondary" @click="$emit('menu',  index, 'add-crossing', false)"
            v-if="true" size="sm">
                <b-icon-shuffle /> 增加軌道相交點 (在下方)
            </b-button>
        </div>
    </div>
</template>