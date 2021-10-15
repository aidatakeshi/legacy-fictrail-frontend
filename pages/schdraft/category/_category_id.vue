<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');
    const sd = require('~/schdraft.js');

    import { BIcon, BIconPencil, BIconPencilSquare, BIconTrash, BIconPlus } from 'bootstrap-vue'
    import TemplateEditor from '../../../components/schdraft/template-editor.vue';

    export default {

        layout: "dashboard",
        components: {
            BIcon, BIconPencil, BIconPencilSquare, BIconTrash, BIconPlus,
            TemplateEditor,
        },

        data() {
            return {
                data_category: {},
                data_groups: {},
                data: {}, //data[group_id]
                //Editing Group
                editing_group: {
                    id: null,
                    category_id: null,
                    title: null,
                    remarks: null,
                    is_enabled: null,
                },
                default_group: {
                    is_enabled: true,
                },
                //Editing Template
                editing_template: {
                    id: null,
                    group_id: null,
                    title: null,
                    is_upbound: null,
                    remarks: null,
                    is_enabled: null,
                },
                default_template: {
                    is_upbound: false,
                    is_enabled: true,
                },
                //Schedule View
                viewing_id: null,
                viewing_title: null,
                viewing_group: null,
                //Misc
                isNew: false,
                editing_failed: false,
            }
        },

        async mounted(){

            //Load Category Data
            var url = "items/schdraft_categories/"+encodeURI(this.$route.params.category_id);
            var response = await $.callAPI(axios, "GET", url, {
                sort: "id", fields: "*",
            });
            if (response.http_status != 200) return false;
            this.data_category = response.data;

            //Load Groups
            await this.loadGroups();

            //Load Templates
            for (var i in this.data_groups){
                await this.loadTemplates(this.data_groups[i].id);
            }


        },

        methods: {
            displayTime: sd.displayTime,
            displaySignedInteger: $.displaySignedInteger,

            async loadGroups(){
                //Get Data
                var response = await $.callAPI(axios, "GET", "items/schdraft_groups/", {
                    filter: { category_id: this.$route.params.category_id },
                    sort: "id",
                });
                if (response.http_status != 200) return false;
                this.data_groups = response.data;
                this.$forceUpdate();
            },

            async loadTemplates(group_id){
                //Get Data
                var response = await $.callAPI(axios, "GET", "items/schdraft_templates/", {
                    filter: { group_id: group_id },
                    sort: "is_upbound,id",
                });
                if (response.http_status != 200) return false;
                this.data[group_id] = response.data;
                this.$forceUpdate();
            },

            editGroup(group){
                for (var i in this.editing_group){
                    this.editing_group[i] = group[i];
                }
                this.isNew = false;
                this.editing_failed = false;
                this.$refs.group_modal.show();
            },

            newGroup(){
                for (var i in this.editing_group){
                    this.editing_group[i] = null;
                }
                for (var i in this.default_group){
                    this.editing_group[i] = this.default_group[i];
                }
                this.isNew = true;
                this.editing_failed = false;
                this.$refs.group_modal.show();
            },

            async removeGroup(group){
                if(!confirm("確定移除？")) return false;
                await $.callAPI(axios, "DELETE", "items/schdraft_groups/"+encodeURI(group.id), {});
                this.loadGroups();
            },

            async submitGroup(){
                if (this.isNew){
                    //Submit New
                    this.editing_group.id = `${this.data_category.id}-${this.editing_group.id}`;
                    this.editing_group.category_id = this.$route.params.category_id;
                    var response = await $.callAPI(axios, "POST", "items/schdraft_groups", this.editing_group);
                }else{
                    //Submit Edit
                    var url = "items/schdraft_groups/"+encodeURI(this.editing_group.id);
                    var response = await $.callAPI(axios, "PATCH", url, this.editing_group);
                }
                if (response.http_status >= 400){
                    //Failed
                    this.editing_failed = true;
                }else{
                    //Success
                    this.loadGroups();
                    this.$refs.group_modal.hide();
                }
            },

            editTemplate(template){
                for (var i in this.editing_template){
                    this.editing_template[i] = template[i];
                }
                this.isNew = false;
                this.editing_failed = false;
                this.$refs.template_modal.show();
            },

            editTemplateFull(template){
                this.editing_template.id = template.id;
                this.$refs.template_full_modal.show();
            },

            newTemplate(group){
                for (var i in this.editing_template){
                    this.editing_template[i] = null;
                }
                for (var i in this.default_template){
                    this.editing_template[i] = this.default_template[i];
                }
                this.editing_template.group_id = group.id;
                this.isNew = true;
                this.editing_failed = false;
                this.$refs.template_modal.show();
            },

            async removeTemplate(template, group){
                if(!confirm("確定移除？")) return false;
                await $.callAPI(axios, "DELETE", "items/schdraft_templates/"+encodeURI(template.id), {});
                this.loadTemplates(group.id);
            },

            async submitTemplate(){
                if (this.isNew){
                    //Submit New
                    this.editing_template.id = `${this.editing_template.group_id}-${this.editing_template.id}`;
                    var response = await $.callAPI(axios, "POST", "items/schdraft_templates", this.editing_template);
                }else{
                    //Submit Edit
                    var url = "items/schdraft_templates/"+encodeURI(this.editing_template.id);
                    var response = await $.callAPI(axios, "PATCH", url, this.editing_template);
                }
                if (response.http_status >= 400){
                    //Failed
                    this.editing_failed = true;
                }else{
                    //Success
                    this.loadTemplates(this.editing_template.group_id);
                    this.$refs.template_modal.hide();
                }
            },

        },

        computed: {
        },

    }

</script>

<template>
    <div>

        <b-breadcrumb>
            <b-breadcrumb-item to="/schdraft">時刻表編輯</b-breadcrumb-item>
            <b-breadcrumb-item active>{{data_category.title}}</b-breadcrumb-item>
        </b-breadcrumb>

        <h1>{{data_category.title}} <small>({{data_category.id}})</small></h1>
        
        <!-- New Group Button -->
        <div class="text-center">
            <b-button variant="success" @click="newGroup()">
                <b-icon-plus /> 新增組別
            </b-button>
        </div>

        <!-- List of Groups -->
        <b-card class="my-4" v-for="group in data_groups" :key="group.id">

            <h2>{{group.title}} <small>({{group.id}})</small> </h2>

            <div class="mb-2">
                <b-badge variant="success" v-if="group.is_enabled">已啟用</b-badge>
                <b-badge variant="danger" v-else>未啟用</b-badge>
            </div>

            <pre v-if="group.remarks">{{group.remarks}}</pre>

            <div class="table-responsive">
                <table class="table table-hover my-table">
                    <thead class="thead-light">
                        <tr>
                            <th style="width: 3rem;"></th>
                            <th>ID</th>
                            <th>模板</th>
                            <th>方向/基準時間</th>
                            <th>啟用?</th>
                            <th>備註</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody v-if="(data[group.id]||[]).length">
                        <tr v-for="item in data[group.id]" :key="item.id">
                            <td>
                                <b-button variant="outline-info" class="p-1" @click="editTemplate(item)">
                                    <b-icon-pencil-square />
                                </b-button>
                                <b-button variant="outline-primary" class="p-1" @click="editTemplateFull(item)">
                                    <b-icon-pencil />
                                </b-button>
                            </td>
                            <td>
                                {{item.id}}
                            </td>
                            <td>
                                <nuxt-link :to="`/schdraft/template/${item.id}`">{{item.title}}</nuxt-link>
                            </td>
                            <td class="small text-center">
                                <strong class="text-primary" v-if="item.is_upbound">上行</strong>
                                <strong class="text-success" v-else>下行</strong><br/>
                                {{displayTime(item.pivot_time)}}{{displaySignedInteger(item.pivot_time_adj)}}
                            </td>
                            <td>{{item.is_enabled ? '✔️' : '❌'}}</td>
                            <td class="remarks">{{item.remarks}}</td>
                            <td class="text-right">
                                <b-button variant="outline-danger" class="p-1" @click="removeTemplate(item, group)">
                                    <b-icon-trash />
                                </b-button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="text-center">
                <b-button variant="outline-info mb-2" @click="newTemplate(group)">
                    <b-icon-plus /> 新增班次模板
                </b-button>
                <b-button variant="info mb-2" @click="editGroup(group)">
                    <b-icon-pencil /> 編輯組別
                </b-button>
                <b-button variant="danger mb-2" @click="removeGroup(group)" :disabled="(data[group.id]||[]).length > 0">
                    <b-icon-trash />
                </b-button>
            </div>

        </b-card>

        <!-- Modal for new/edit group -->
        <b-modal ref="group_modal" centered scrollable hide-footer :title="isNew ? '新增組別' : '編輯組別'">

            <div class="row">
                <div class="col-sm-4">ID</div>
                <div class="col-sm-8">
                    <b-input-group :prepend="isNew ? `${this.data_category.id}-` : null">
                        <b-form-input v-model="editing_group.id" @focus="editing_failed = false" :disabled="!isNew" />
                    </b-input-group>
                </div>
                <div class="col-sm-4">組別標題</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing_group.title" @focus="editing_failed = false" />
                </div>
                <div class="col-12">
                    組別備註<br/>
                    <b-form-textarea v-model="editing_group.remarks" size="sm" rows="5"
                    @focus="editing_failed = false" />
                </div>
                <div class="col-12">
                    <b-form-checkbox switch v-model="editing_group.is_enabled" @focus="editing_failed = false">
                        啟用組別
                    </b-form-checkbox>
                </div>
            </div>
            
            <div class="text-center">
                <div class="text-danger" v-if="editing_failed">提交失敗</div>
            </div>

            <b-button variant="primary" block class="mt-2" @click="submitGroup()">提交</b-button>

        </b-modal>

        <!-- Modal for new/edit template (full) -->
        <b-modal ref="template_full_modal" centered scrollable hide-footer title="編輯班次模板" size="xl">
            <template-editor :template-id="editing_template.id" @submit="$refs.template_full_modal.hide()" />
        </b-modal>

        <!-- Modal for new/edit template -->
        <b-modal ref="template_modal" centered scrollable hide-footer :title="isNew ? '新增班次模板' : '編輯班次模板'">

            <div class="row">
                <div class="col-sm-4">ID</div>
                <div class="col-sm-8">
                    <b-input-group :prepend="isNew ? `${this.editing_template.group_id}-` : null">
                        <b-form-input v-model="editing_template.id" @focus="editing_failed = false" :disabled="!isNew" />
                    </b-input-group>
                </div>
                <div class="col-sm-4">模板標題</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing_template.title" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">方向</div>
                <div class="col-sm-8">
                    <b-form-radio-group v-model="editing_template.is_upbound"
                        :options="[{text: '下行', value: false}, {text: '上行', value: true}]"
                    ></b-form-radio-group>
                </div>
                <div class="col-12">
                    模板備註<br/>
                    <b-form-textarea v-model="editing_template.remarks" size="sm" rows="5"
                    @focus="editing_failed = false" />
                </div>
                <div class="col-12">
                    <b-form-checkbox switch v-model="editing_template.is_enabled" @focus="editing_failed = false">
                        啟用模板
                    </b-form-checkbox>
                </div>
            </div>
            
            <div class="text-center">
                <div class="text-danger" v-if="editing_failed">提交失敗</div>
            </div>

            <b-button variant="primary" block class="mt-2" @click="submitTemplate()">提交</b-button>

        </b-modal>

    </div>
</template>