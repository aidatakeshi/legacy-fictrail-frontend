<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPencil, BIconPlus, BIconTrash } from 'bootstrap-vue'

    export default {

        layout: "dashboard",
        components: { BIcon, BIconPencil, BIconPlus, BIconTrash },

        data() {
            return {
                data_train_types: {},
                data: {},
                isNew: false,
                filter: {
                    operator_id: this.$route.query.operator_id,
                },
                editing: {
                    train_type_id: null,
                    major_operator_id: null,
                    name_chi: null,
                    name_eng: null,
                    name_eng_short: null,
                    color: null,
                    color_text: null,
                    max_speed_kph: null,
                    remarks: null,
                },
                editing_train_type_id_original: null,
                editing_id: null,
                editing_failed: false,
                editing_type: {},
            }
        },

        mounted(){
            this.init();
        },
        
        watchQuery: function(){
            this.init();
        },

        methods: {

            async init(){
                //Load Train Types
                this.data_train_types = await $.getItems(axios, "train_types", {
                    sort: "-sort",
                    fields: "id, name_chi, name_eng",
                    array: true,
                });

                //Load Train Names
                for (var i in this.data_train_types){
                    var type_id = this.data_train_types[i].id;
                    this.data[type_id] = [];
                    this.loadData(type_id);
                }
            },

            async loadData(type_id){
                this.data[type_id] = await $.getItems(axios, "train_names", {
                    sort: 'major_operator_id, name_eng',
                    filter: {
                        train_type_id: type_id,
                        major_operator_id: this.$route.query.operator_id,
                    },
                    fields: [
                        "*", "major_operator_id.id", "major_operator_id.name_chi", "major_operator_id.color", 
                    ],
                    array: true,
                });
                this.$forceUpdate();
            },

            updateSearch(){
                var url = '/train-names?';
                if (this.filter.operator_id) url += ('operator_id=' + encodeURI(this.filter.operator_id)) + '&';
                this.$router.push(url);
            },

            editItem(name, type){
                for (var i in this.editing){
                    this.editing[i] = name[i];
                }
                this.editing_id = name.id;
                this.editing.major_operator_id = (name.major_operator_id || {}).id;
                this.editing_train_type_id_original = type.id;
                this.editing.train_type_id = type.id;
                //
                this.isNew = false;
                this.editing_failed = false;
                this.$refs._modal.show();
            },

            newItem(type = {}){
                for (var i in this.editing){
                    this.editing[i] = null;
                }
                this.editing_train_type_id_original = type.id;
                this.editing.train_type_id = type.id;
                //
                this.isNew = true;
                this.editing_failed = false;
                this.$refs._modal.show();
            },
            
            async removeItem(name, type){
                if(!confirm("確定移除？")) return false;
                await $.callAPI(axios, "DELETE", "items/train_names/"+encodeURI(name.id), {});
                this.loadData(type.id);
            },

            async submit(){
                if (this.isNew){
                    //Submit New
                    var response = await $.callAPI(axios, "POST", "items/train_names", this.editing);
                }else{
                    //Submit Edit
                    var url = "items/train_names/"+encodeURI(this.editing_id);
                    var response = await $.callAPI(axios, "PATCH", url, this.editing);
                }
                if (response.http_status >= 400){
                    //Failed
                    this.editing_failed = true;
                }else{
                    //Success
                    this.loadData(this.editing.train_type_id);
                    if (!this.isNew && this.editing_train_type_id_original != this.editing.train_type_id){
                        this.loadData(this.editing_train_type_id_original);
                    }
                    this.$refs._modal.hide();
                }
            },
            
        },

    }

</script>

<template>
    <div>
        <h1>列車名稱</h1>

        <div class="text-center">
            <b-button variant="success" @click="newItem()">
                <b-icon-plus scale="1.2"></b-icon-plus> 新增列車名
            </b-button>
        </div>

        <!-- Search Box -->
        <b-card class="my-4">
            <div class="row">
                <div class="col-sm-6 col-lg-4">
                    主要營運者：<br/>
                    <select-operator v-model="filter.operator_id" nullable @input="updateSearch()" />
                </div>
            </div>
        </b-card>

        <!-- List of Train Names -->
        <div v-for="(type, i) in data_train_types" :key="i">
            <div class="my-4" v-if="(data[type.id] || []).length">

                <h2>{{type.name_chi}} <small>{{type.name_eng}}</small></h2>

                <!--<pagination-wrapper :id="type.id" :page="page[type.id]" :count="count[type.id]" :limit="limit"
                @page-clicked="pageChanged">-->

                    <!-- Table -->
                    <div class="table-responsive">
                        <table class="table table-hover my-table">
                            <thead class="thead-light">
                                <tr>
                                    <th style="width: 3rem;"></th>
                                    <th>主要營運者</th>
                                    <th style="width: 1rem;"></th>
                                    <th>列車名稱</th>
                                    <th>最高速度</th>
                                    <th>備註</th>
                                    <th style="width: 3rem;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(name, j) in data[type.id]" :key="j">
                                    <td>
                                        <b-button variant="outline-info" class="px-2 py-1" @click="editItem(name, type)">
                                            <b-icon-pencil />
                                        </b-button>
                                    </td>
                                    <td>
                                        <color-box :color="name.major_operator_id.color"></color-box>
                                        <strong>{{name.major_operator_id.name_chi}}</strong>
                                    </td>
                                    <td>
                                        <color-box :color="name.color"></color-box>
                                    </td>
                                    <td class="text-left" style="line-height: 1rem;">
                                        <strong>
                                            {{name.name_chi}}<br/><small>{{name.name_eng}}</small>
                                        </strong>
                                    </td>
                                    <td>{{name.max_speed_kph}} km/h</td>
                                    <td class="remarks">{{name.remarks}}</td>
                                    <td>
                                        <b-button variant="outline-danger" class="px-2 py-1" @click="removeItem(name, type)">
                                            <b-icon-trash />
                                        </b-button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!--------------------->
                <!--</pagination-wrapper>-->

                <div class="text-center">
                    <b-button variant="info" @click="newItem(type)">
                        <b-icon-plus scale="1.2"></b-icon-plus> 新增列車名
                    </b-button>
                </div>

            </div>
        </div>

        <!-- Modal for New / Edit Train Name -->
        <b-modal ref="_modal" centered scrollable hide-footer
        :title="isNew ? '新增列車名稱' : '編輯列車名稱'">

            <div class="row">
                <div class="col-sm-4">列車種別</div>
                <div class="col-sm-8">
                    <select-train-type v-model="editing.train_type_id" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">主要營運者</div>
                <div class="col-sm-8">
                    <select-operator v-model="editing.major_operator_id" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">中文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_chi" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">英文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_eng" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">代表色彩</div>
                <div class="col-sm-8 d-flex">
                    <b-form-input type="color" v-model="editing.color" @focus="editing_failed = false" />
                    <b-form-input type="text" v-model="editing.color" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">文字色彩</div>
                <div class="col-sm-8 d-flex">
                    <b-form-input type="color" v-model="editing.color_text" @focus="editing_failed = false" />
                    <b-form-input type="text" v-model="editing.color_text" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">最高速度 (km/h)</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.max_speed_kph" @focus="editing_failed = false" />
                </div>
                <div class="col-12">
                    備註<br/>
                    <b-form-textarea v-model="editing.remarks" size="sm" rows="5"
                    @focus="editing_failed = false" />
                </div>
            </div>
            
            <div class="text-center">
                <div class="text-danger" v-if="editing_failed">提交失敗</div>
            </div>

            <b-button variant="primary" block class="mt-2" @click="submit">提交</b-button>

        </b-modal>
        
        <!------------------------------------------------------------------------------------->

    </div>
</template>