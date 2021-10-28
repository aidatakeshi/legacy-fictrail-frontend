<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

export default {
    
    props: {
        id: String,
    },

    data() {
        return {
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
            var url = `station/${encodeURIComponent(this.id)}/name`;
            var response = await $.callAPI(axios, "GET", url);
            if (response.http_status == 200){
                this.display = response?.name_chi;
            }
        },
    },

}

</script>

<template>
    <span>{{display}}</span>
</template>