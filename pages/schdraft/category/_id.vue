<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPen, BIconTrash } from 'bootstrap-vue'
    import EditSchdraftTemplate from '../../../components/schdraft/edit-schdraft-template.vue';
    
    import ListItem from '@/components/list-item';
    import EditItem from '@/components/edit-item';
    import ButtonNew from '@/components/button-new';

    export default {

        layout: "dashboard",
        components:{
            EditSchdraftTemplate,
            BIcon, BIconPen, BIconTrash,
            ListItem, EditItem, ButtonNew,
        },

        data() {
            return {
                data_category: {},
                data: [],
                trigger: 0,
                duplicate_modal_data: {},
                duplicate_modal_title: null,
                duplicate_modal_id: null,
                duplicate_modal_error: false,
            }
        },

        async mounted(){
            //Load data of categories
            var $route = `items/schdraft_category/${encodeURIComponent(this.$route.params.id)}`;
            var response = await $.callAPI(axios, 'GET', $route);
            if (response.http_status >= 400) return false;
            this.data_category = response.data;
            //Load data of groups & templates
            await this.loadData();
        },

        methods: {
            async loadData(){
                var $route = `items/schdraft_group?templates=1&category_id=${encodeURIComponent(this.$route.params.id)}&list=1`;
                var response = await $.callAPI(axios, 'GET', $route);
                if (response.http_status >= 400) return false;
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
                if (response.http_status >= 400) return false;
                this.loadData();
            },
            showTemplateEdit(id){
                this.$refs.template_modal.showEdit(id);
            },
            showTemplateNew(data){
                this.$refs.template_modal.showNew(data);
            },
            async duplicateTemplateModal(id){
                var $route = `items/schdraft_template/${encodeURIComponent(id)}`;
                var response = await $.callAPI(axios, 'GET', $route);
                if (response.http_status >= 400) return false;
                this.duplicate_modal_data = response.data;
                this.duplicate_modal_title = (this.duplicate_modal_data||{}).title;
                this.duplicate_modal_id = (this.duplicate_modal_data||{}).id;
                this.duplicate_modal_error = false;
                this.$refs.duplicate_template_modal.show();
            },
            async duplicateTemplateSubmit(){
                var data = this.duplicate_modal_data;
                data.title = this.duplicate_modal_title;
                data.id = this.duplicate_modal_id;
                var $route = `items/schdraft_template`;
                var response = await $.callAPI(axios, 'POST', $route, data);
                if (response.http_status >= 400){
                    this.duplicate_modal_error = true;
                }else{
                    this.$refs.duplicate_template_modal.hide();
                    this.loadData();
                }
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
        <edit-item ref="template_modal" type="schdraft_template" @change="loadData" />
        
        <!-- Duplicate Template Modal -->
        <b-modal ref="duplicate_template_modal" size="md" title="複製模板" centered hide-footer>
            <div class="row">
                <div class="col-sm-4">ID</div>
                <div class="col-sm-8">
                    <b-form-input v-model="duplicate_modal_id" size="sm"
                    @focus="duplicate_modal_error = false;" />
                </div>
                <div class="col-sm-4">標題</div>
                <div class="col-sm-8">
                    <b-form-input v-model="duplicate_modal_title" size="sm"
                    @focus="duplicate_modal_error = false;" />
                </div>
                <div class="col-12 text-danger text-center" v-if="duplicate_modal_error">
                    提交錯誤
                </div>
                <div class="col-12 mt-2">
                    <b-button variant="primary" block size="sm" @click="duplicateTemplateSubmit">
                        提交
                    </b-button>
                </div>
            </div>

        </b-modal>

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
                @change="loadData" @edit="showTemplateEdit" @duplicate="duplicateTemplateModal"
            />

            <button-new variant="outline-success" text="新增時刻表模板" @click="showTemplateNew({group_id: group.id})" />

        </div>

    </div>
</template>