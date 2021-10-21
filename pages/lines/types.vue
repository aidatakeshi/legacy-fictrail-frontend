<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {

        layout: "dashboard",

        data() {
            return {
                data: [],
                trigger: 0,
            }
        },

        async mounted(){
            await this.loadData();
        },

        methods: {
            async loadData(){
                var response = await $.callAPI(axios, 'GET', 'items/line_type', {});
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
        <h1>路線類別</h1>

        <!-- Breadcrumb -->
        <div class="mt-2">
            <b-breadcrumb>
                <b-breadcrumb-item to="/lines">路線</b-breadcrumb-item>
                <b-breadcrumb-item to="/lines/groups">路線組合</b-breadcrumb-item>
                <b-breadcrumb-item to="/lines/types" active>路線類別</b-breadcrumb-item>
                <b-breadcrumb-item to="/lines/stats-hr">HR的路線統計</b-breadcrumb-item>
            </b-breadcrumb>
        </div>

        <!-- Create New -->
        <button-new @click="showNew()" />

        <!-- Content -->
        <div class="my-2">
            <list-item type="line_type" :data="data" :trigger="trigger"
                @change="loadData" @edit="showEdit"
            />
        </div>

        <!-- Edit Modal -->
        <edit-item ref="edit_modal" type="line_type" @change="loadData" />

        <!-- Create New -->
        <button-new @click="showNew()" />

    </div>
</template>