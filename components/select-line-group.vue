<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPlus } from 'bootstrap-vue'

export default {

    components: { BIcon, BIconPlus },
    
    props: {
        value: null,
    },

    data() {
        return {
            options: [],
            selected: null,
            editing: {
                id: null, name_chi: null, name_eng: null, name_eng_short: null,
            },
            editing_failed: false,
        };
    },

    watch: {
        value(){
            this.selected = this.value ? this.value : null;
        },
    },

    async mounted(){
        this.selected = this.value ? this.value : null;
        this.loadData();
    },

    methods: {
        async loadData(){
            //Load Operators List
            var results = await $.getItems(axios, "line_groups", {array: true});
            var options = [{ value: null, text: '-- 獨立路線 --'}];
            for (var i in results){
                options.push({
                    value: results[i].id,
                    text: results[i].name_chi + ' (' + results[i].id + ')',
                });
            }
            this.options = options;
        },

        openModal(){
            for (var i in this.editing){
                this.editing[i] = null;
            }
            this.editing_failed = false;
            this.$refs.new_line_group_modal.show();
        },

        async submitNew(){
            var response = await $.callAPI(axios, "POST", "items/line_groups", this.editing);
            if (response.http_status >= 400){
                //Failed
                this.editing_failed = true;
            }else{
                //Success
                this.loadData();
                this.selected = this.editing.id;
                this.$refs.new_line_group_modal.hide();
            }
        },
    },

}

</script>

<template>
    <div>
        <!-- Selector -->
        <div class="d-flex">
            <b-form-select v-model="selected" :options="options"
                @input="$emit('input', selected); $emit('focus');"
            ></b-form-select>
            <b-button class="p-1" variant="info" @click="openModal()">
                <b-icon-plus />
            </b-button>
        </div>

        <!-- Modal for new -->
        <b-modal ref="new_line_group_modal" centered scrollable hide-footer title="新增路線組">

            <div class="row">
                <div class="col-sm-4">ID</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.id" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">中文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_chi" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">英文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_eng" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">簡稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_eng_short" @focus="editing_failed = false" />
                </div>
            </div>

            <div class="text-center">
                <div class="text-danger" v-if="editing_failed">提交失敗</div>
            </div>

            <b-button variant="primary" block class="mt-2" @click="submitNew()">提交</b-button>

        </b-modal>
    </div>
</template>