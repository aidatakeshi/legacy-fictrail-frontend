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
                var response = await $.callAPI(axios, 'GET', 'items/schdraft_category', {});
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
        <h1>時刻表編輯</h1>

        <!-- Create New -->
        <button-new @click="showNew()" />

        <!-- Content -->
        <div class="my-2">
            <list-item type="schdraft_category" :data="data" :trigger="trigger"
                @change="loadData" @edit="showEdit"
            />
        </div>

        <!-- Edit Modal -->
        <edit-item ref="edit_modal" type="schdraft_category" @change="loadData" />

        <!-- Create New -->
        <button-new @click="showNew()" />

    </div>
</template>