<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

export default {
    
    props: {
        value: null,
        nullable: Boolean,
        remember: Boolean,
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
    },

    async mounted(){
        this.selected = this.value ? this.value : (this.remember ? localStorage.getItem('select-prefecture') : null);

        if (this.nullable){
            var options = [{ value: null, text: '-- 不設定營運者 --' }];
        }else{
            var options = [{ value: null, text: '-- 請選擇 --', disabled: true }];
        }

        //Load Prefectures List
        var result = await $.getItems(axios, 'prefecture_areas', {
            sort: 'sort', array: true, fields: 'name_chi',
        }, 'prefectures', {
            sort: 'id', array: true, fields: 'name_chi,name_chi_suffix',
        }, 'area_id', 'prefectures');

        //Prepare Options
        for (var i in result){
            options.push({ value: null, text: '【'+result[i].name_chi+'】', disabled: true });
            for (var j in result[i].prefectures){
                options.push({
                    value: result[i].prefectures[j].id,
                    text: result[i].prefectures[j].name_chi + result[i].prefectures[j].name_chi_suffix
                    + ' (' + result[i].prefectures[j].id + ')',
                });
            }
        }
        this.options = options;
    },

    methods: {
        inputHandler(){
            if (this.remember){
                localStorage.setItem('select-prefecture', this.selected);
            }
            this.$emit('input', this.selected);
            this.$emit('focus');
        },
    },

}

</script>

<template>
    <div>
        <b-form-select v-model="selected" :options="options" @input="inputHandler()"></b-form-select>
    </div>
</template>