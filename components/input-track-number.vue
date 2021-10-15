<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BootstrapVue, BIcon, BIconX, BIconPlus } from 'bootstrap-vue'

export default {

    components: { BIcon, BIconX, BIconPlus },
    
    props: {
        value: null,
    },

    data() {
        return {
            value$: [],
            new_text: null,
        };
    },

    watch: {
        value(){
            if (Array.isArray(this.value)){
                this.value$ = this.value;
            }
        }
    },

    mounted(){
        if (Array.isArray(this.value)){
            this.value$ = this.value;
        }
    },

    methods: {
        inputHandler(){
            this.value$.sort(function(a,b){
                var a_int = parseInt(a);
                var b_int = parseInt(b);
                if (a_int > b_int) return +1;
                if (a_int < b_int) return -1;
                if (a > b) return +1;
                if (a < b) return -1;
                return 0;
            });
            this.$emit('focus');
            this.$emit('input', this.value$);
        },
    },

}

</script>

<template>
    <div>
        <b-form-tags v-model="value$" separator=" ,;" remove-on-delete
            @input="inputHandler"
        ></b-form-tags>
    </div>
</template>