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
                isNew: false,
                editing: {
                    id: null,
                    operator_id: null,
                    name_chi: null,
                    name_chi_short: null,
                    name_eng: null,
                    name_eng_short: null,
                    color: null,
                    color_text: null,
                    remarks: null,
                    is_premium: null,
                    sort: null,
                },
                editing_failed: false,
            }
        },

        async mounted(){

            //Load Train Types
            this.loadData();

        },

        methods: {

            async loadData(){
                this.data_train_types = await $.getItems(axios, "train_types", {
                    sort: '-sort',
                    fields: [
                        "id", "name_chi", "name_chi_short", "name_eng", "name_eng_short",
                        "color", "is_premium", "remarks", "sort",
                        "operator_id.id", "operator_id.name_chi", "operator_id.color", 
                    ],
                });
                this.$forceUpdate();
            },

            editItem(type){
                for (var i in this.editing){
                    this.editing[i] = type[i];
                }
                this.editing.operator_id = (type.operator_id || {}).id;
                //
                this.isNew = false;
                this.editing_failed = false;
                this.$refs._modal.show();
            },

            newItem(){
                for (var i in this.editing){
                    this.editing[i] = null;
                }
                //
                this.isNew = true;
                this.editing_failed = false;
                this.$refs._modal.show();
            },
            
            async removeItem(item){
                if(!confirm("確定移除？")) return false;
                await $.callAPI(axios, "DELETE", "items/train_types/"+encodeURI(item.id), {});
                this.loadData();
            },

            async submit(){
                if (this.isNew){
                    //Submit New
                    var response = await $.callAPI(axios, "POST", "items/train_types", this.editing);
                }else{
                    //Submit Edit
                    var url = "items/train_types/"+encodeURI(this.editing.id);
                    var response = await $.callAPI(axios, "PATCH", url, this.editing);
                }
                if (response.http_status >= 400){
                    //Failed
                    this.editing_failed = true;
                }else{
                    //Success
                    this.loadData();
                    this.$refs._modal.hide();
                }
            },

        },

    }

</script>

<template>
    <div>
        <h1>列車種別</h1>

        <div class="text-center mb-4">
            <b-button variant="success" @click="newItem()">
                <b-icon-plus scale="1.2"></b-icon-plus> 新增種別
            </b-button>
        </div>

        <!-- List of Train Types -->

        <div class="table-responsive mb-4">
            <table class="table table-hover my-table">
                <thead class="thead-light">
                    <tr>
                        <th style="width: 3rem;"></th>
                        <th>主要營運者</th>
                        <th style="width: 1rem;"></th>
                        <th>種別</th>
                        <th style="width: 1rem;"></th>
                        <th>簡稱</th>
                        <th>ID</th>
                        <th>備註</th>
                        <th>排序</th>
                        <th style="width: 3rem;"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(type, i) in data_train_types" :key="i">
                        <td>
                            <b-button variant="outline-info" class="px-2 py-1" @click="editItem(type)">
                                <b-icon-pencil />
                            </b-button>
                        </td>
                        <td v-if="type.operator_id">
                            <color-box :color="type.operator_id.color"></color-box>
                            <strong>{{type.operator_id.name_chi}}</strong>
                        </td>
                        <td v-else>/</td>
                        <td>
                            <color-box :color="type.color"></color-box>
                        </td>
                        <td class="text-left" style="line-height: 1rem;">
                            <strong>
                                {{type.name_chi}}<br/><small>{{type.name_eng}}</small>
                            </strong>
                        </td>
                        <td>
                            <b-badge variant="info" v-if="type.is_premium">有料</b-badge>
                        </td>
                        <td style="line-height: 1rem;">
                            {{type.name_chi_short}}<br/><small>{{type.name_eng_short}}</small>
                        </td>
                        <td>{{type.id}}</td>
                        <td class="remarks">
                            {{type.remarks}}
                        </td>
                        <td>{{type.sort}}</td>
                        <td>
                            <b-button variant="outline-danger" class="px-2 py-1" @click="removeItem(type)">
                                <b-icon-trash />
                            </b-button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="text-center mb-4">
            <b-button variant="info" @click="newItem()">
                <b-icon-plus scale="1.2"></b-icon-plus> 新增種別
            </b-button>
        </div>

        <!-- Modal for New / Edit Train Type -->
        <b-modal ref="_modal" centered scrollable hide-footer
        :title="isNew ? '新增列車種別' : '編輯列車種別'">

            <div class="row">
                <div class="col-sm-4">ID</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.id" :disabled="!isNew" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">主要營運者</div>
                <div class="col-sm-8">
                    <select-operator nullable v-model="editing.operator_id" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">中文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_chi" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">中文簡稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_chi_short" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">英文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_eng" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">英文簡稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_eng_short" @focus="editing_failed = false" />
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
                <div class="col-sm-4">有料列車?</div>
                <div class="col-sm-8 py-2">
                    <b-form-checkbox v-model="editing.is_premium" switch></b-form-checkbox>
                </div>
                <div class="col-sm-4">排序</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.sort" @focus="editing_failed = false" />
                </div>
                <div class="col-12">
                    備註<br/>
                    <b-form-textarea v-model="editing.remarks" rows="5" size="sm"
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