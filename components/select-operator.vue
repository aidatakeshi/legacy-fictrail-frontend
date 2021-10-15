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
        this.selected = this.value ? this.value : (this.remember ? localStorage.getItem('select-operator') : null);

        if (this.nullable){
            var options = [{ value: null, text: '-- 不設定營運者 --' }];
        }else{
            var options = [{ value: null, text: '-- 請選擇 --', disabled: true }];
        }

        //Load Operators List
        var result = await $.getItems(axios, 'operator_types', {
            sort: 'sort', array: true, fields: 'name_chi',
        }, 'operators', {
            sort: 'id', array: true, fields: 'name_chi',
        }, 'operator_type_id', 'operators');

        //Prepare Options
        for (var i in result){
            options.push({ value: null, text: '【'+result[i].name_chi+'】', disabled: true });
            for (var j in result[i].operators){
                options.push({
                    value: result[i].operators[j].id,
                    text: result[i].operators[j].name_chi + ' (' + result[i].operators[j].id + ')',
                });
            }
        }
        this.options = options;
    },

    methods: {
        inputHandler(){
            if (this.remember){
                localStorage.setItem('select-operator', this.selected);
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