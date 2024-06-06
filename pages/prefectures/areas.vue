<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import ListItem from '@/components/list-item';
    import EditItem from '@/components/edit-item';
    import ButtonNew from '@/components/button-new';

    export default {

        layout: "dashboard",
        
        components: {
            ListItem, EditItem, ButtonNew,
        },

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
                var response = await $.callAPI(axios, 'GET', 'items/prefecture_area', {});
                if (response.http_status >= 400) return false;
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
        <h1>廣域地區</h1>

        <!-- Breadcrumb -->
        <div class="mt-2">
            <b-breadcrumb>
                <b-breadcrumb-item to="/prefectures">都府縣省</b-breadcrumb-item>
                <b-breadcrumb-item to="/prefectures/areas" active>廣域地區</b-breadcrumb-item>
            </b-breadcrumb>
        </div>

        <!-- Create New -->
        <button-new @click="showNew()" />

        <!-- Content -->
        <div class="my-2">
            <list-item type="prefecture_area" :data="data" :trigger="trigger"
                @change="loadData" @edit="showEdit"
            />
        </div>

        <!-- Edit Modal -->
        <edit-item ref="edit_modal" type="prefecture_area" @change="loadData" />

        <!-- Create New -->
        <button-new @click="showNew()" />

    </div>
</template>