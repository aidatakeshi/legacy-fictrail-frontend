<script>

import { BIcon, BIconPlus } from 'bootstrap-vue'

export default {
    components:{
        BIcon, BIconPlus,
    },
    props: {
        variant: String,
        size: String,
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
    },
}
</script>

<template>
    <div class="text-center my-2">
        <b-button :variant="variant||'success'" :size="size||'sm'" @click="$emit('click')">
            <b-icon-plus scale="1.2"></b-icon-plus> 新增
        </b-button>
    </div>
</template>