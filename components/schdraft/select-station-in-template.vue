<script>

/**
 * Select Item (Generic Use)
 */

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const config = require('~/config.select-item.js');

export default {
    props: {
        value: null,
        schTemplate: Array,
        nullable: Boolean,
        disabled: Boolean,
        remember: Boolean,
        size: String,
        placeholder: String,
    },
    data() {
        return {
            options: [],
            selected: null,
        };
    },
    watch: {
        value(){
            this.selected = this.value ? this.value : null;
        },
        schTemplate(){
            this.updateOptions();
        },
    },
    mounted(){
        this.updateOptions();
        this.selected = this.value ? this.value : null;
    },
    methods:{
        async updateOptions(){
            var station_ids = [];
            for (var i in this.schTemplate){
                if (!this.schTemplate[i].line_id) continue;
                station_ids.push(this.schTemplate[i].station_id);
            }
            var response = await $.callAPI(axios, 'POST', 'station/get-by-ids?from_selecter=1', {
                ids: station_ids,
            })
            if (!response.http_status == 200) return false;
            //Null Option
            if (this.nullable){
                var options = [{ value: null, text: this.placeholder || '-- 不設定 --' }];
            }else{
                var options = [{ value: null, text: this.placeholder || '-- 請選擇 --', disabled: true }];
            }
            //Other Options
            var result = response.data;
            for (var i in result){
                var value = result[i].id;
                var label = `${result[i].name_chi} [${result[i].name_eng}]`
                options.push({ value: value, text: label });
            }
            this.options = options;
            //Update selected
            this.selected = this.value ? this.value : null;
        },

        inputHandler(){
            this.$emit('input', this.selected);
            this.$emit('focus');
        },
    },
}
</script>

<template>
    <div>
        <b-form-select v-model="selected" :options="options"
            :size="size" :disabled="disabled"
            @input="inputHandler"
            @change="$emit('change', selected)"
            @focus="$emit('focus')"
        ></b-form-select>
    </div>
</template>