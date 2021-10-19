<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {

        layout: "dashboard",

        data() {
            return {
                data: null,
                trigger: 0,
                query: {
                    sort_lines: 'name_eng',
                    operator_id: null,
                    name: null,
                },
            }
        },

        async mounted(){
            await this.loadData();
        },

        methods: {
            async loadData(){
                var response = await $.callAPI(axios, 'GET', 'items/line_types?list=1', this.query);
                if (response.http_response >= 400) return false;
                this.data = response.data;
                this.trigger++;
            },
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
        <h1>路線</h1>

        <!-- Breadcrumb -->
        <div class="mt-2">
            <b-breadcrumb>
                <b-breadcrumb-item to="/lines" active>路線</b-breadcrumb-item>
                <b-breadcrumb-item to="/lines/groups">路線組合</b-breadcrumb-item>
                <b-breadcrumb-item to="/lines/types">路線類別</b-breadcrumb-item>
            </b-breadcrumb>
        </div>

        <!-- Filter -->
        <b-card body-class="row">
            <div class="col-sm-6 col-md-4">
                <strong>排序方式</strong>
                <b-form-select v-model="query.sort_lines" size="sm" @change="loadData">
                    <b-form-select-option value="name_eng">英文名稱 (順序)</b-form-select-option>
                    <b-form-select-option value="-name_eng">英文名稱 (倒序)</b-form-select-option>
                    <b-form-select-option value="operator_id">營運者 (順序)</b-form-select-option>
                    <b-form-select-option value="-operator_id">營運者 (倒序)</b-form-select-option>
                    <b-form-select-option value="length_km">長度 (順序)</b-form-select-option>
                    <b-form-select-option value="-length_km">長度 (倒序)</b-form-select-option>
                    <b-form-select-option value="max_speed_kph">最高速度 (順序)</b-form-select-option>
                    <b-form-select-option value="-max_speed_kph">最高速度 (倒序)</b-form-select-option>
                </b-form-select>
            </div>
            <div class="col-sm-6 col-md-4">
                <strong>營運者</strong>
                <select-item type="operator" v-model="query.operator_id" nullable
                size="sm" @change="loadData" />
            </div>
            <div class="col-sm-6 col-md-4">
                <strong>名稱</strong>
                <b-form-input type="text" v-model="query.name" size="sm" @change="loadData" />
            </div>
        </b-card>

        <!-- Create New -->
        <button-new @click="showNew()" />

        <!-- Content -->
        <template v-for="line_type in data">
            <div :key="line_type.id" v-if="line_type.lines.length">

                <h2>{{line_type.name_chi}}</h2>

                <list-item type="line" :data="line_type.lines" :trigger="trigger"
                    @change="loadData" @edit="showEdit"
                />

                <button-new @click="showNew({line_type_id: line_type.id})" />

            </div>
        </template>

        <!-- Edit Modal -->
        <edit-item ref="edit_modal" type="line" @change="loadData" />

    </div>
</template>