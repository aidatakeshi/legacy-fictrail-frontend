<script>
import axios from '~/plugins/axios'
import selectItem from './select-item.vue';
const $ = require('~/common.js');

export default {
  components: { selectItem },
    props: {
        value: null,
        size: String,
        disabled: Boolean,
    },
    data() {
        return {
            category_id: null,
            selected: null,
        };
    },
    watch: {
        value(){
            this.init();
        },
    },
    mounted(){
        this.init();
    },
    methods:{
        async init(){
            if (!this.value) return false;
            var $route = `items/schdraft_template/${encodeURIComponent(this.value)}?from_selecter=1&group=1`;
            var response = await $.callAPI(axios, 'GET', $route);
            if (!response.http_status >= 400) return false;
            this.category_id = response?.data?.group?.category_id;
            this.selected = this.value;
        },
    },
}
</script>

<template>
    <div>
        <select-item type="schdraft_category" v-model="category_id"
            :disabled="disabled" :size="size"
        />
        <select-item type="schdraft_template of category"
            :filter="category_id" v-model="selected"
            :disabled="(category_id === null) || (disabled === true)" :size="size"
            @input="$emit('input', selected)" @change="$emit('change', selected)"
        />
    </div>
</template>