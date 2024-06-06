<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import ListItem from '@/components/list-item';
    import EditItem from '@/components/edit-item';
    import ButtonNew from '@/components/button-new';

    export default {

        layout: "dashboard",

        data() {
            return {
                data: [],
                trigger: 0,
            }
        },

        components: {
            ListItem, EditItem, ButtonNew,
        },

        async mounted(){
            await this.loadData();
        },

        methods: {
            async loadData(){
                var response = await $.callAPI(axios, 'GET', 'items/operator_type?more=1', {});
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
        <h1>營運者</h1>

        <!-- Breadcrumb -->
        <div class="mt-2">
            <b-breadcrumb>
                <b-breadcrumb-item to="/operators" active>營運者</b-breadcrumb-item>
                <b-breadcrumb-item to="/operators/types">營運者類別</b-breadcrumb-item>
            </b-breadcrumb>
        </div>

        <!-- Create New -->
        <button-new @click="showNew()" />

        <!-- Content -->
        <template v-for="operator_type in data">
            <div :key="operator_type.id" v-if="operator_type.operators.length">

                <h2>{{operator_type.name_chi}}</h2>

                <list-item type="operator" :data="operator_type.operators" :trigger="trigger"
                    @change="loadData" @edit="showEdit"
                />

                <button-new @click="showNew({operator_type_id: operator_type.id})" />

            </div>
        </template>

        <!-- Edit Modal -->
        <edit-item ref="edit_modal" type="operator" @change="loadData" />

    </div>
</template>