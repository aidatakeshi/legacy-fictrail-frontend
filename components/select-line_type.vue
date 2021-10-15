<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

export default {
    
    props: {
        value: null,
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
        var results = await $.getItems(axios, "line_types", {sort: "sort", array: true});
        var options = [{ value: null, text: '-- 請選擇 --', disabled: true }];
            for (var i in results){
                options.push({
                    value: results[i].id,
                    text: results[i].name_chi,
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