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
        type: null,
        nullable: Boolean,
        disabled: Boolean,
        remember: Boolean,
        filter: null,
        size: String,
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
        filter(){
            this.selected = this.value ? this.value : null;
            this.$emit('input', this.selected);
            this.updateOptions();
        },
    },
    mounted(){
        this.updateOptions();
    },
    methods:{
        async updateOptions(){
            //Null Option
            if (this.nullable){
                var options = [{ value: null, text: '-- 不設定 --' }];
            }else{
                var options = [{ value: null, text: '-- 請選擇 --', disabled: true }];
            }

            //Content Option
            var configOfItem = config.data[this.type];
            if (!configOfItem) return false;

            //If filter is required but no filter query, halt
            if (configOfItem.api_filter && !this.filter){
                this.options = options;
                return false;
            }

            //Prepare Queries
            var queries = {};
            queries.from_selecter = '1';
            if (configOfItem.api_filter) queries[configOfItem.api_filter] = this.filter;
            if (configOfItem.api_query) queries[configOfItem.api_query] = '1';

            //Call API
            var response = await $.callAPI(axios, 'GET', 'items/'+configOfItem.api_call, queries);
            if (response.http_response >= 400) return false;
            var result = response.data;
            var option_matched = false;

            //Make Options (case 1: no api_query & api_sub)
            if (!configOfItem.api_query && !configOfItem.api_sub){
                for (var i in result){
                    var value = result[i].id;
                    var label = result[i][configOfItem.display];
                    if (configOfItem.display2) label += ` [${result[i][configOfItem.display2]}]`
                    options.push({ value: value, text: label });
                    if (value == this.value) option_matched = true;
                }
            }
            //Make Options (case 2: with api_query & api_sub)
            else{
                for (var i in result){
                    var sub_result = result[i][configOfItem.api_sub];
                    if (!sub_result.length) continue;
                    var value = result[i].id;
                    var label = result[i][configOfItem.display];
                    if (configOfItem.display2) label += ` [${result[i][configOfItem.display2]}]`
                    options.push({ text: `【${label}】`, disabled: true});
                    for (var i in sub_result){
                        var value = sub_result[i].id;
                        var label = sub_result[i][configOfItem.display_sub];
                        if (configOfItem.display_sub2) label += ` [${sub_result[i][configOfItem.display_sub2]}]`
                        options.push({ value: value, text: label });
                        if (value == this.value) option_matched = true;
                    }
                }
            }
            //Output Options
            this.options = options;
            //Selected
            this.selected = this.value ? this.value : null;
            if (this.selected == null && this.remember){
                this.selected = localStorage.getItem('select-'+this.type);
                this.$emit('input', this.selected);
            }
            //No Option Matched? Emit null
            if (this.value !== null && !option_matched){
                this.selected = null;
                this.$emit('input', null);
            }
        },

        inputHandler(){
            if (this.remember){
                localStorage.setItem('select-'+this.type, this.selected);
            }
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