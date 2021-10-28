<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

export default {
    
    props: {
        id: String,
        color: Boolean,
    },

    data() {
        return {
            colorValue: null,
            display: null,
        };
    },

    watch: {
        id(){
            this.load();
        },
    },

    async mounted(){
        this.load();
    },

    methods: {
        async load(){
            if (!this.id) return false;
            var url = `line/${encodeURIComponent(this.id)}/name`;
            var response = await $.callAPI(axios, "GET", url);
            if (response.http_status == 200){
                this.display = response?.name_chi;
                this.colorValue = response?.color;
            }
        },
    },

}

</script>

<template>
    <span>
        <color-box :color="colorValue" v-if="color" />
        {{display}}
    </span>
</template>