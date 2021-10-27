<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPen, BIconTrash } from 'bootstrap-vue'
    import EditSchdraftTemplate from '../../../components/schdraft/edit-schdraft-template.vue';

    export default {

        layout: "dashboard",
        components:{
            EditSchdraftTemplate,
            BIcon, BIconPen, BIconTrash,
        },

        data() {
            return {
                data_category: {},
                data: [],
                trigger: 0,
            }
        },

        async mounted(){
            //Load data of categories
            var $route = `items/schdraft_category/${encodeURIComponent(this.$route.params.id)}`;
            var response = await $.callAPI(axios, 'GET', $route);
            if (response.http_response >= 400) return false;
            this.data_category = response.data;
            //Load data of groups & templates
            await this.loadData();
        },

        methods: {
            async loadData(){
                var $route = `items/schdraft_group?templates=1&category_id=${encodeURIComponent(this.$route.params.id)}&list=1`;
                var response = await $.callAPI(axios, 'GET', $route);
                if (response.http_response >= 400) return false;
                this.data = response.data;
                this.trigger++;
            },
            showGroupEdit(id){
                this.$refs.edit_modal.showEdit(id);
            },
            showGroupNew(data){
                this.$refs.edit_modal.showNew(data);
            },
            async removeGroup(id){
                var c = confirm(`確認移除? (ID = ${id})`);
                if (!c) return false;
                var route = 'items/schdraft_group/'+encodeURIComponent(id);
                var response = await $.callAPI(axios, 'DELETE', route, {});
                if (response.http_response >= 400) return false;
                this.loadData();
            },
            showTemplateEdit(id){
                this.$refs.template_modal.showEdit(id);
            },
            showTemplateNew(data){
                this.$refs.template_modal.showNew(data);
            },
            duplicateTemplate(id){
                this.$refs.template_modal.showEdit(id, true);
            },
        },

    }

</script>

<template>
    <div class="my-4">
        <h2>{{data_category.title}}</h2>

        <!-- Breadcrumb -->
        <div class="mt-2">
            <b-breadcrumb>
                <b-breadcrumb-item to="/schdraft">時刻表編輯</b-breadcrumb-item>
                <b-breadcrumb-item :to="`/schdraft/${$route.params.id}`" active>
                    {{data_category.title}}
                </b-breadcrumb-item>
            </b-breadcrumb>
        </div>

        <!-- Remarks -->
        <div class="my-remarks">
            <strong>分類備註：</strong>
            <span>{{data_category.remarks}}</span>
        </div>

        <!-- Create New -->
        <button-new text="新增時刻表群組" @click="showGroupNew({category_id: $route.params.id})" />

        <!-- Edit Group Modal -->
        <edit-item ref="edit_modal" type="schdraft_group" @change="loadData" />

        <!-- Edit Template Modal -->
        <edit-schdraft-template ref="template_modal" @change="loadData" />

        <!-- Content (Templates in Each Group) -->
        <div v-for="group in data" :key="group.id">

            <hr/>

            <h3>{{group.title}}</h3>

            <div class="mb-2 d-flex">
                <div>
                    <b-button variant="info" class="my-button-small" @click="showGroupEdit(group.id)">
                        <b-icon-pen />
                    </b-button>
                    <b-badge variant="secondary">{{group.id}}</b-badge>
                    <b-badge variant="warning">Sort: {{group.sort}}</b-badge>
                    <b-badge variant="success" v-if="group.is_enabled">啟用</b-badge>
                    <b-badge variant="danger" v-else>停用</b-badge>
                </div>
                <div class="ml-auto">
                    <b-button variant="danger" class="my-button-small" @click="removeGroup(group.id)">
                        <b-icon-trash />
                    </b-button>
                </div>
            </div>

            <div class="my-remarks mb-2">
                <strong>群組備註：</strong>
                <span>{{group.remarks}}</span>
            </div>

            <list-item type="schdraft_template" :data="group.templates" :trigger="trigger"
                @change="loadData" @edit="showTemplateEdit" @duplicate="duplicateTemplate"
            />

            <button-new text="新增時刻表模板" @click="showTemplateNew({group_id: group.id})" />

        </div>

    </div>
</template>