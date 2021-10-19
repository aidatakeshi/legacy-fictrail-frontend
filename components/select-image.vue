<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const env = require('~/config.js');

import { BIcon, BIconImage, BIconX } from 'bootstrap-vue';

export default {
    components: {
        BIcon, BIconImage, BIconX,
    },
    props: {
        value: null,
        width: null,
        height: null,
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
        //Upload
        upload($event){
            var input = $event.target;
            if (!(input.files && input.files[0])) return false;
            var formData = new FormData();
            formData.append('file', input.files[0]);
            //Call API
            var $this = this;
            axios({
                url: env.API_BASE_URL+'/file',
                method: 'POST',
                headers:{'Authorization': $.getToken()},
                data: formData,
            })
            .then((result) => {
                var data = result.data;
                if (!data) return false;
                this.$emit('input', data.uuid + '.' + data.extension);
            })
            .catch((err) => {

            });
        },
        //Remove
        remove(){
            this.$emit('input', null);
        },
    },
    computed:{
        //Image URL
        image_url(){
            if (!this.value) return null;
            return `${env.API_BASE_URL}/file/${this.value}`;
        },
        //Image Style
        image_style(){
            var obj = {};
            if (this.width) obj['max-width'] = this.width;
            if (this.height) obj['max-height'] = this.height;
            return obj;
        },
    },
}
</script>

<template>
    <div>
        <b-card body-class="text-center">
            <img v-if="image_url" :src="image_url" :style="image_style" />
            <div v-else>沒有圖像</div>
        </b-card>
        <div class="text-right">
            <div class="btn-group btn-group-sm d-flex" role="group">
                <b-button variant="outline-info" @click="$refs.file.click()" class="w-100">
                    <b-icon-image /> 更換
                </b-button>
                <b-button variant="outline-secondary" @click="remove" class="w-100">
                    <b-icon-x scale="1.2" /> 移除
                </b-button>
            </div>
        </div>
        <input type="file" ref="file" @change="upload($event)" hidden />
    </div>
</template>