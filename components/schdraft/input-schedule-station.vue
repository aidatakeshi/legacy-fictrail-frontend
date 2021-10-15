<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

export default {
    
    props: {
        value: null,
        schedule: Array,
        placeholder: String,
    },

    data() {
        return {
            options: [],
        };
    },

    async mounted(){
        var station_ids = [];
        for (var i in this.schedule){
            station_ids.push(this.schedule[i].station_id);
        }
        //Call API
        var response = await $.callAPI(axios, "GET", "items/stations", {
            filter: { id: { _in: station_ids } },
            fields: 'id,name_chi',
        });
        if (response.http_status != 200) return false;
        //name_by_id
        var name_by_id = {};
        for (var i in response.data){
            name_by_id[response.data[i].id] = response.data[i].name_chi;
        }
        //options
        this.options = [{ value: null, text: this.placeholder || '-- 請選擇車站 --' }];
        for (var i in station_ids){
            this.options.push({ value: station_ids[i], text: `#${i-(-1)}: ` + name_by_id[station_ids[i]] });
        }
    },

    methods: {
        
    },

}

</script>

<template>
    <b-form-select :options="options" v-model="value" @input="$emit('input', value)" />
</template>