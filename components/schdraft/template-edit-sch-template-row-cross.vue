<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import {
    BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck, BIconChevronDown, BIconShuffle,
} from 'bootstrap-vue';
import TemplateEditSchTemplateMod from './template-edit-sch-template-mod.vue';

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck, BIconChevronDown, BIconShuffle,
        TemplateEditSchTemplateMod,
    },
    props: {
        value: Object,
        index: Number,
    },
    data() {
        return {
            options_track_cross_points: [],
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

        //Cross ID Modal
        async showCrossIDModal(){
            var $route = `items/station/${encodeURIComponent(this.value.station_id)}`;
            var response = await $.callAPI(axios, 'GET', $route);
            if (response.http_status != 200) return false;
            this.options_track_cross_points = response.data?.track_cross_points || [];
            this.$refs.track_cross_point_modal.show();
        },
        crossIDSelected(id){
            this.value.cross_id = id;
            this.changed();
            this.$refs.track_cross_point_modal.hide();
        },
    },
    computed: {
    },
}
</script>

<template>
    <tr class="item-crossing">

        <!-- Buttons -->
        <td>
            <b-button variant="link" class="p-0 text-secondary" size="sm" @click="$emit('show-menu', index)">
                <b-icon-chevron-down />
            </b-button>
        </td>

        <!-- Station Name -->
        <td style="white-space: normal;">
            <name-station :id="value.station_id" />
            <b-icon-shuffle />
        </td>

        <!-- Cross ID -->
        <td colspan="3" class="text-left">
            <b-button variant="outline-dark" size="sm" tabindex="3" class="px-2" @click="showCrossIDModal">
                {{value.cross_id}}
            </b-button>
            <!-- Track Cross Point Modal -->
            <b-modal ref="track_cross_point_modal" size="md" hide-header hide-footer scrollable centered>
                <b-button variant="outline-secondary" class="my-1 p-1" block
                v-for="(crossing, i) in options_track_cross_points" :key="i" @click="crossIDSelected(crossing.id)">
                    {{crossing.label}} <small>({{crossing.id}})</small>
                </b-button>
                <div v-if="!options_track_cross_points.length" class="text-center">
                    此站未有設定軌道相交點。
                </div>
            </b-modal>
        </td>

        <!-- Time -->
        <td>
            <div style="width: 6em;">
                <input-time v-model="value.time1" tabindex="2" italic small center suffix="入" size="sm"
                background-color="#fff8ee" @input="changed();" :next-value="value.time2" />
            </div>
        </td>
        <td colspan="3">
            <div style="width: 6em;">
                <input-time v-model="value.time2" tabindex="2" italic small center suffix="出" size="sm"
                background-color="#fff8ee" @input="changed();" :prev-value="value.time1" />
            </div>
        </td>

        <!-- Mods -->
        <td class="mods">
            <template-edit-sch-template-mod v-model="value.mod" :default-value="value"
            :station-id="value.station_id" is-cross />
        </td>

        <!-- Remarks -->
        <td>
            <!-- Remarks Here -->
            <div class="remarks w-100" @click="$refs.remarks_modal.show()"><!---
            --->{{value.remarks}} <!---
            ---><span class="text-primary"><b-icon-pen /></span><!---
        ---></div>
            <b-modal ref="remarks_modal" title="備註" hide-footer centered>
                <b-form-textarea size="sm" rows="8" v-model="value.remarks" />
            </b-modal>
        </td>

        <!------------------------------------------------------------------>
    </tr>
</template>

<style scoped>
.item-crossing{
    font-size: 90%;
    color: #333;
    font-style: italic;
    background-color: #fec;
}
.item-crossing button{
    font-size: 90%;
    font-style: italic;
}

</style>