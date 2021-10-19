<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {

        layout: "dashboard",

        data() {
            return {
                data: null,
                trigger: 0,
            }
        },

        async mounted(){
            await this.loadData();
        },

        methods: {
            async loadData(){
                var response = await $.callAPI(axios, 'GET', 'items/prefecture_area?more=1', {});
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
        <h1>都府縣省</h1>

        <!-- Breadcrumb -->
        <div class="mt-2">
            <b-breadcrumb>
                <b-breadcrumb-item to="/prefectures" active>都府縣省</b-breadcrumb-item>
                <b-breadcrumb-item to="/prefectures/areas">廣域地區</b-breadcrumb-item>
            </b-breadcrumb>
        </div>

        <!-- Create New -->
        <button-new @click="showNew()" />

        <!-- Content -->
        <template v-for="area in data">
            <div :key="area.id" v-if="area.prefectures.length">

                <h2>{{area.name_chi}}</h2>

                <list-item type="prefecture" :data="area.prefectures" :trigger="trigger"
                    @change="loadData" @edit="showEdit"
                />

                <button-new @click="showNew({area_id: area.id})" />

            </div>
        </template>

        <!-- Edit Modal -->
        <edit-item ref="edit_modal" type="prefecture" @change="loadData" />

    </div>
</template>