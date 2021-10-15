<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

export default {
    
    props: {
        value: null,
        nullable: Boolean,
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
        this.selected = this.value ? this.value : null;

        //Load Operators List
        var results = await $.getItems(axios, "train_types", {
            sort: "-sort",
            fields: "*,operator_id.name_chi",
        });
        if (this.nullable){
            var options = [{ value: null, text: '-- 不設定種別 --' }];
        }else{
            var options = [{ value: null, text: '-- 請選擇 --', disabled: true }];
        }
        for (var i in results){
            var suffix = "";
            if (results[i].operator_id){
                suffix = ' [' + results[i].operator_id.name_chi + ']';
            }
            options.push({
                value: results[i].id,
                text: results[i].name_chi + suffix,
            });
        }
        this.options = options;
    },

}

</script>

<template>
    <div>
        <b-form-select v-model="selected" :options="options"
            @input="$emit('input', selected); $emit('focus');"
        ></b-form-select>
    </div>
</template>