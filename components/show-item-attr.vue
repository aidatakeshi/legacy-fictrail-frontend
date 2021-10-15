<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

export default {
    
    props: {
        type: String,
        id: String,
        attr: {type: String, default: "name_chi"},
        color: Boolean,
    },

    data() {
        return {
            display: null,
            colorValue: null,
        };
    },

    watch: {
        type(){
            this.load();
        },
        id(){
            this.load();
        },
        attr(){
            this.load();
        },
    },

    async mounted(){
        this.load();
    },

    methods: {
        async load(){
            if (!this.type) return false;
            if (!this.id) return false;
            var url = `items/${encodeURI(this.type)}/${encodeURI(this.id)}`;
            var response = await $.callAPI(axios, "GET", url, {
                fields: this.attr + (this.color ? ', color' : ''),
            });
            if (response.http_status == 200){
                this.display = response.data?.[this.attr];
                this.colorValue = response.data?.color;
            }
        },
    },

}

</script>

<template>
    <span>
        <color-box v-if="color" :color="colorValue" />{{display}}
    </span>
</template>