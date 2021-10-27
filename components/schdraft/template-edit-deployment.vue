<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPen, BIconX } from 'bootstrap-vue'

export default {
    components:{
        BIcon, BIconPen, BIconX,
    },
    props: {
        value: Object,
        isNew: Boolean,
        isCopy: Boolean,
    },
    data() {
        return {

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
    },
    computed: {

    },
}
</script>

<template>
    <div>
        {{value.deployment}}
    </div>
</template>