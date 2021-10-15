<script>

import axios from '~/plugins/axios'
const smod = require('~/schdraft-mods.js');

export default {
    
    props: {
        rule: {type: Object, default: () => {}},
    },

    data() {
        return {
            displaySegments: [],
        };
    },

    watch: {
        "rule.rule": function(){
            this.updateDisplay();
        },
        "rule.param": function(){
            this.updateDisplay();
        },
    },

    mounted(){
        this.updateDisplay();
    },

    methods: {
        async updateDisplay(){
            this.displaySegments = await smod.getRuleDisplay(this.rule, axios) || [];
        },
    },

}

</script>

<template>
    <span>
        <span v-for="(segment, i) in displaySegments" :key="i">
            <strong class="text-info" v-if="i % 2">{{segment}}</strong>
            <span v-else>{{segment}}</span>
        </span>
    </span>
</template>