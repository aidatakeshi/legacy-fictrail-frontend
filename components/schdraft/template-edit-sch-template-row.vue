<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import {
    BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck, BIconChevronDown,
} from 'bootstrap-vue';
import TemplateEditSchTemplateMod from './template-edit-sch-template-mod.vue';

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck, BIconChevronDown,
        TemplateEditSchTemplateMod,
    },
    props: {
        value: Object,
        index: Number,
        isFirst: Boolean,
        isLast: Boolean,
        prevValue: Number,
        nextValue: Number,
    },
    data() {
        return {
            options_tracks: [],
            station_remarks: null,
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
        //Track Number Modal
        async showTrackNumberModal(){
            var $route = `items/station/${encodeURIComponent(this.value.station_id)}`;
            var response = await $.callAPI(axios, 'GET', $route);
            if (response.http_status != 200) return false;
            this.options_tracks = response.data?.tracks || [];
            this.station_remarks = response.data?.remarks;
            this.$refs.track_select_modal.show();
        },
        trackSelected(track){
            this.value.track = track;
            this.changed();
            this.$refs.track_select_modal.hide();
        },
    },
    computed: {
        time1Diff(){
            if (!this.prevValue) return null;
            return $.displayTimeIntervalAlt(this.value.time1 - this.prevValue);
        },
        time2Diff(){
            var prev = (this.value.time1 || this.prevValue);
            if (!prev) return null;
            return $.displayTimeIntervalAlt(this.value.time2 - prev);
        },
    },
}
</script>

<template>
    <tr>

        <!-- Buttons -->
        <td>
            <b-button variant="link" class="p-0 text-secondary" size="sm" @click="$emit('show-menu', index)">
                <b-icon-chevron-down />
            </b-button>
        </td>

        <!-- Station Name -->
        <td class="name" style="white-space: normal;">
            <strong><name-station :id="value.station_id" /></strong>
            <b-button variant="link" class="p-0 text-primary" size="sm" @click="$emit('edit-station', value.station_id)">
                <b-icon-pen />
            </b-button>
        </td>

        <!-- Distance -->
        <td v-if="isFirst">-</td>
        <td v-else>
            TBD
        </td>

        <!-- Mileage -->
        <td>
            TBD
        </td>

        <!-- Stop / Pass Toggler -->
        <td v-if="!value.is_pass">
            <b-button variant="outline-dark" class="m-0" style="line-height: 1em;"
            @click="value.is_pass = true; changed();" tabindex="1">
                停<br/>車
            </b-button>
        </td>
        <td v-else>
            <b-button variant="outline-secondary" class="m-0" style="line-height: 1em;"
            @click="value.is_pass = false; changed();" tabindex="1">
                通<br/>過
            </b-button>
        </td>

        <!-- Time -->
        <td>
            <input-time v-model="value.time1" v-if="!isFirst" tabindex="2"
                :italic="value.is_pass" size="sm" center small
                :suffix="(value.is_pass) ? '到' : '着'"
                :prev-value="prevValue" :next-value="value.time2 || nextValue"
                @input="changed();"
            />
            <input class="form-control form-control-sm" disabled v-else /><!-- Dummy -->
            <input-time v-model="value.time2" v-if="!isLast" tabindex="2"
                :bold="!value.is_pass" :italic="value.is_pass" size="sm" center small
                :suffix="(value.is_pass) ? (value.time1 ? '開' : '通') : '發'"
                :prev-value="value.time1 || prevValue" :next-value="nextValue"
                @input="changed();"
            />
            <input class="form-control form-control-sm" disabled v-else /><!-- Dummy -->
        </td>

        <!-- Time Differece -->
        <td class="text-secondary" style="font-size: 60%; line-height: 2.5em;">
            <span style="font-style: italic;" v-if="value.is_pass">{{time1Diff}}</span>
            <span v-else>{{time1Diff}}</span>
            <br/>
            <span style="font-style: italic;" v-if="value.is_pass">{{time2Diff}}</span>
            <span style="font-weight: bold;" v-else>{{time2Diff}}</span>
        </td>

        <!-- Track -->
        <td>
            <b-button variant="outline-dark" size="sm" tabindex="3"
            style="min-width: 2em;" @click="showTrackNumberModal">
                {{value.track || '-'}}
            </b-button>
            <!-- Tracks Selecter Modal -->
            <b-modal ref="track_select_modal" title="月台/軌道" hide-footer scrollable centered>
                <div class="my-remarks mb-1" v-if="station_remarks">
                    <strong>車站備註：</strong><br/>
                    <span>{{station_remarks}}</span>
                </div>
                <div class="row">
                    <div class="col-3 col-sm-2" v-for="(track, i) in options_tracks" :key="i">
                        <b-button :variant="(track != value.track ? 'outline-' : '') + 'secondary'"
                        class="my-1 py-1" block @click="trackSelected(track)">
                            {{track}}
                        </b-button>
                    </div>
                </div>
            </b-modal>
        </td>

        <!-- Is Express Track -->
        <td>
            <b-button variant="outline-secondary" size="sm" tabindex="4" v-if="!value.is_express_track"
            class="my-1 text-danger" @click="value.is_express_track = true; changed();">
                <b-icon-x scale="1.5" />
            </b-button>
            <b-button variant="outline-secondary" size="sm" tabindex="4" v-else
            class="my-1 text-success" @click="value.is_express_track = false; changed();">
                <b-icon-check scale="1.5" />
            </b-button>
        </td>

        <!-- Mods -->
        <td class="mods">
            <template-edit-sch-template-mod v-model="value.mod" :default-value="value"
            :station-id="value.station_id" />
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