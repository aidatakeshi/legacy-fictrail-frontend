<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {

        layout: "dashboard",

        data() {
            return {
                trigger: 0,
                query: {
                    sort: 'name_eng',
                    operator_id: null,
                    prefecture_id: null,
                    name: null,
                },
            }
        },

        async mounted(){
        },

        methods: {
            showEdit(id){
                this.$refs.edit_modal.showEdit(id);
            },
            showNew(data){
                this.$refs.edit_modal.showNew(data);
            },
        },

    }

</script>

<template>
    <div class="my-4">
        <h1>車站</h1>

        <!-- Filter -->
        <b-card body-class="row">
            <div class="col-sm-6 col-lg-3">
                <strong>排序方式</strong>
                <b-form-select v-model="query.sort" size="sm" @change="trigger++">
                    <b-form-select-option value="name_eng">英文名稱 (順序)</b-form-select-option>
                    <b-form-select-option value="-name_eng">英文名稱 (倒序)</b-form-select-option>
                    <b-form-select-option value="operator_id">營運者 (順序)</b-form-select-option>
                    <b-form-select-option value="-operator_id">營運者 (倒序)</b-form-select-option>
                    <b-form-select-option value="prefecture_id">地區 (順序)</b-form-select-option>
                    <b-form-select-option value="-prefecture_id">地區 (倒序)</b-form-select-option>
                </b-form-select>
            </div>
            <div class="col-sm-6 col-lg-3">
                <strong>營運者</strong>
                <select-item type="operator" v-model="query.operator_id" nullable
                size="sm" @change="trigger++" />
            </div>
            <div class="col-sm-6 col-lg-3">
                <strong>地區</strong>
                <select-item type="prefecture" v-model="query.prefecture_id" nullable
                size="sm" @change="trigger++" />
            </div>
            <div class="col-sm-6 col-lg-3">
                <strong>名稱</strong>
                <b-form-input type="text" v-model="query.name" size="sm" @change="trigger++" />
            </div>
        </b-card>

        <!-- Create New -->
        <button-new @click="showNew()" />

        <!-- Content -->
        <div class="my-2">
            <list-item type="station" :trigger="trigger"
            :query="{'list': '1'}" :query2="query" @edit="showEdit" />
        </div>

        <!-- Create New -->
        <button-new @click="showNew()" />

        <!-- Edit Modal -->
        <edit-item ref="edit_modal" type="station" @change="trigger++" />

    </div>
</template>