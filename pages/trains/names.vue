<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import ListItem from '@/components/list-item';
    import EditItem from '@/components/edit-item';
    import ButtonNew from '@/components/button-new';
    import SelectItem from '@/components/select-item';

    export default {

        layout: "dashboard",
        
        components: {
            ListItem, EditItem, ButtonNew, SelectItem,
        },

        data() {
            return {
                data: [],
                trigger: 0,
                query: {
                    major_operator_id: null,
                },
            }
        },

        async mounted(){
            await this.loadData();
        },

        methods: {
            async loadData(){
                var response = await $.callAPI(axios, 'GET', 'items/train_types?more=1&list=1', this.query);
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
        <h1>列車名稱</h1>

        <!-- Breadcrumb -->
        <div class="mt-2">
            <b-breadcrumb>
                <b-breadcrumb-item to="/trains/types">列車種別</b-breadcrumb-item>
                <b-breadcrumb-item to="/trains/names" active>列車名稱</b-breadcrumb-item>
            </b-breadcrumb>
        </div>

        <!-- Filter -->
        <b-card body-class="row">
            <div class="col-sm-6 col-md-4">
                <strong>主要營運者</strong>
                <select-item type="operator" v-model="query.major_operator_id" nullable
                size="sm" @change="loadData" />
            </div>
        </b-card>

        <!-- Create New -->
        <button-new @click="showNew()" />

        <!-- Content -->
        <template v-for="train_type in data">
            <div :key="train_type.id" v-if="train_type.trainNames.length">

                <h2>{{train_type.name_chi}}</h2>

                <list-item type="train_name" :data="train_type.trainNames" :trigger="trigger"
                    @change="loadData" @edit="showEdit"
                />

                <button-new @click="showNew({train_type_id: train_type.id})" />

            </div>
        </template>

        <!-- Edit Modal -->
        <edit-item ref="edit_modal" type="train_name" @change="loadData" />

    </div>
</template>