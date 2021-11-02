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
        nullable: Boolean,
        hideSecondSelect: Boolean
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
        handleNullCase(){
            if (this.category_id === null){
                this.selected = null;
                this.$emit('input', null);
                this.$emit('change', null);
            }
        },
    },
}
</script>

<template>
    <div>
        <select-item type="schdraft_category" v-model="category_id" @change="handleNullCase"
            :disabled="disabled" :size="size" :nullable="nullable"
        />
        <select-item type="schdraft_template of category" v-if="category_id !== null || !hideSecondSelect"
            :filter="category_id" v-model="selected"
            :disabled="(category_id === null) || (disabled === true)" :size="size" :nullable="nullable"
            @input="$emit('input', selected)" @change="$emit('change', selected)"
        />
    </div>
</template>