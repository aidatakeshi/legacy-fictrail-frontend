<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const sd_common = require('~/schdraft-common.js');

import { BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck } from 'bootstrap-vue'

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconPlus, BIconTrash, BIconCheck,
    },
    props: {
        value: Array,
    },
    data() {
        return {
            index: null,
            station_id: null,
            isUpper: null,
            extend_station_line_id: null,
            extend_station_station_id: null,
            extend_station_all_between: null,
            extend_station_loop_handling: null,
            insert_station_options: [],
            insert_station_selected: [],
            add_crossing_options: [],
            add_crossing_selected: null,
        };
    },
    watch: {

    },
    mounted(){

    },
    methods:{
        //Show Modal
        showModal(index, action, isUpper){
            this.index = index;
            this.station_id = this.value[index]?.station_id;
            this.isUpper = isUpper;
            if (!this.station_id) return false;

            //增加區間 / 車站
            if (action == 'extend-station'){
                this.extend_station_line_id = null;
                this.extend_station_station_id = null;
                this.extend_station_all_between = true;
                this.extend_station_loop_handling = false;
                return this.$refs.extend_station_modal.show();
            }

            //插入中間車站
            if (action == 'insert-station'){
                this.insert_station_selected = [];
                this.insert_station_options = [];
                this.insert_section_loadData();
                return this.$refs.insert_station_modal.show();
            }

            //移除車站
            if (action == 'remove-station'){
                return this.remove_station_submit();
            }

            //增加軌道相交點
            if (action == 'add-crossing'){
                return this.add_crossing_submit();
            }

            //移除軌道相交點
            if (action == 'remove-crossing'){
                return this.remove_crossing_submit();
            }

            //
            if (action == 'move-crossing'){
                return this.move_crossing_submit();
            }
        },

        //Extend Station Modal
        async extend_station_submit(){
            if (!this.extend_station_line_id) return false;
            if (!this.extend_station_station_id) return false;
            //Get Station List
            var $route = `line/${encodeURIComponent(this.extend_station_line_id)}/stations?from_selecter=1`;
            var response = await $.callAPI(axios, 'GET', $route);
            if (response.http_status != 200) return false;
            var station_list = response.data;
            //Search Station
            var index1 = null;
            var index2 = null;
            if (!this.extend_station_loop_handling){
                //Up to down
                for (var i = 0; i < station_list.length; i++){
                    if (station_list[i].station_id == this.station_id) index1 = i;
                    if (station_list[i].station_id == this.extend_station_station_id) index2 = i;
                }
            }else{
                //Down to up
                for (var i = station_list.length - 1; i >= 0; i--){
                    if (station_list[i].station_id == this.station_id) index1 = i;
                    if (station_list[i].station_id == this.extend_station_station_id) index2 = i;
                }
            }
            if (index1 === null || index2 === null || index1 === index2) return false;
            //Proceed
            var i_step = (index2 > index1) ? +1 : -1;
            var is_upbound = (index2 > index1 ? false : true);
            if (this.isUpper){
                is_upbound = !is_upbound;
                //Upwards
                if (this.extend_station_all_between){
                    for (var i = index1+i_step; i*i_step <= index2*i_step; i += i_step){
                        this.value.unshift(sd_common.getNewStationItem({
                            line_id: this.extend_station_line_id,
                            station_id: station_list[i].station_id,
                            is_upbound: is_upbound,
                        }));
                    }
                }else{
                    this.value.unshift(sd_common.getNewStationItem({
                        line_id: this.extend_station_line_id,
                        station_id: station_list[index2].station_id,
                        is_upbound: is_upbound,
                    }))
                }
            }else{
                //Downwards
                this.value[this.index].line_id = this.extend_station_line_id;
                this.value[this.index].is_upbound = is_upbound;
                if (this.extend_station_all_between){
                    for (var i = index1+i_step; i*i_step <= index2*i_step; i += i_step){
                        this.value.push(sd_common.getNewStationItem({
                            line_id: this.extend_station_line_id,
                            station_id: station_list[i].station_id,
                            is_upbound: is_upbound,
                        }));
                    }
                }else{
                    this.value.push(sd_common.getNewStationItem({
                        line_id: this.extend_station_line_id,
                        station_id: station_list[index2].station_id,
                        is_upbound: is_upbound,
                    }));
                }
            }
            //Finish
            this.$emit('input', this.value);
            this.$refs.extend_station_modal.hide();
        },

        //Insert Station Modal
        async insert_section_loadData(){
            var line_id = this.value[this.index]?.line_id;
            var station_id = this.value[this.index]?.station_id;
            var station2_id = null;
            for (var i = this.index + 1; i < this.value.length; i++){
                if (!this.value[i].is_cross){
                    station2_id = this.value[i]?.station_id;
                    break;
                }
            }
            if (!line_id || !station_id || !station2_id) return false;
            //Get Station List
            var $route = `line/${encodeURIComponent(line_id)}/stations?from_selecter=1`;
            var response = await $.callAPI(axios, 'GET', $route);
            if (response.http_status != 200) return false;
            var station_list = response.data;
            //Search Station
            var index1 = null;
            var index2 = null;
            for (var i in station_list){
                if (station_list[i].station_id == station_id) index1 = i * 1;
                if (station_list[i].station_id == station2_id) index2 = i * 1;
            }
            //Add to Options
            if (index2 > index1){
                for (var i = index1 + 1; i < index2; i++){
                    this.insert_station_options.push({
                        value: station_list[i].station_id,
                        text: station_list[i].name_chi,
                    });
                    this.insert_station_selected.push(station_list[i].station_id);
                }
            }else{
                for (var i = index1 - 1; i > index2; i--){
                    this.insert_station_options.push({
                        value: station_list[i].station_id,
                        text: station_list[i].name_chi,
                    });
                    this.insert_station_selected.push(station_list[i].station_id);
                }
            }
        },
        insert_station_submit(){
            for (var i = this.insert_station_options.length - 1; i >= 0; i--){
                var station_id = this.insert_station_options[i].value;
                if (this.insert_station_selected.includes(station_id)){
                    this.value.splice(this.index + 1, 0, sd_common.getNewStationItem({
                        line_id: this.value[this.index]?.line_id,
                        is_upbound: this.value[this.index]?.is_upbound,
                        station_id: station_id,
                    }));
                }
            }
            //Finish
            this.$emit('input', this.value);
            this.$refs.insert_station_modal.hide();
        },

        //Remove Station (no modal)
        remove_station_submit(){
            if (!confirm('確認移除？')) return false;
            var a = this.index;
            var b = this.index;
            //Find for neighbouring cross items
            while (this.value[a-1]?.station_id == this.station_id) a--;
            while (this.value[b+1]?.station_id == this.station_id) b++;
            //Remove
            this.value.splice(a, b-a+1);
            this.$emit('input', this.value);
        },

        //Add Crossing Modal (no modal)
        add_crossing_submit(){
            var $index = this.index + (this.isUpper ? 0 : 1);
            this.value.splice($index, 0, sd_common.getNewCrossingItem({
                station_id: this.station_id,
            }));
            this.$emit('input', this.value);
        },

        //Remove Crossing (no modal)
        remove_crossing_submit(){
            if (!confirm('確認移除？')) return false;
            //Remove
            this.value.splice(this.index, 1);
            this.$emit('input', this.value);
        },

        //Move Crossing (no modal)
        move_crossing_submit(){
            var index1 = this.index * 1;
            var index2 = (this.isUpper ? index1 - 1 : index1 + 1);
            var temp1 = this.value[index1];
            var temp2 = this.value[index2];
            this.value[index1] = Object.assign({}, temp2);
            this.value[index2] = Object.assign({}, temp1);
            this.$emit('input', this.value);
        },
    },
    computed: {
    },
}
</script>

<template>
    <div>

        <b-modal ref="extend_station_modal" title="增加區間 / 車站" size="sm" hide-footer centered>

            <div>選擇路線：</div>
            <select-line-of-station :station-id="station_id" v-model="extend_station_line_id" size="sm" />
            
            <div>選擇車站：</div>
            <select-station-of-line :line-id="extend_station_line_id" v-model="extend_station_station_id" size="sm" />
            <b-form-checkbox switch v-model="extend_station_all_between" class="my-1" size="sm">
                加入沿途所有車站
            </b-form-checkbox>

            <b-form-checkbox switch v-model="extend_station_loop_handling" class="my-1" size="sm">
                如車站在路線出現了兩次，選擇較下方選項
            </b-form-checkbox>

            <b-button variant="primary" block @click="extend_station_submit">
                提交
            </b-button>

        </b-modal>

        <b-modal ref="insert_station_modal" title="插入中間車站" size="sm" hide-footer centered>
            <div v-if="insert_station_options.length">

                <div>選擇加入的車站：</div>
                <b-form-checkbox-group class="my-2" v-model="insert_station_selected" size="sm"
                stacked :options="insert_station_options" />

                <b-button variant="primary" block @click="insert_station_submit">
                    提交
                </b-button>

            </div>
            <div v-else>兩站之間並沒有其他車站。</div>
        </b-modal>

    </div>
</template>