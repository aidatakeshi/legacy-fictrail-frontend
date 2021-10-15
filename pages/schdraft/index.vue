<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPencil, BIconTrash, BIconPlus, BIconCaretDown } from 'bootstrap-vue'

    export default {

        layout: "dashboard",
        components: { BIcon, BIconPencil, BIconTrash, BIconPlus, BIconCaretDown },

        data() {
            return {
                data: {},
                isNew: false,
                editing: {
                    id: null,
                    title: null,
                    is_enabled: null,
                    remarks: null,
                },
                editing_failed: false,
                editing_type: {},
                category_selected: {},
            }
        },

        async mounted(){
            await this.loadData();
        },

        methods: {

            async loadData(){
                //Load operator types
                var response = await $.callAPI(axios, "GET", "items/schdraft_categories", {
                    sort: "id", fields: "*",
                });
                if (response.http_status != 200) return false;
                this.data = response.data;
            },

            editItem(item, type){
                for (var i in this.editing){
                    this.editing[i] = item[i];
                }
                this.isNew = false;
                this.editing_failed = false;
                this.$refs._modal.show();
            },

            async removeItem(item, type){
                if(!confirm("確定移除？")) return false;
                await $.callAPI(axios, "DELETE", "items/schdraft_categories/"+encodeURI(item.id), {});
                this.loadData();
            },

            newItem(type = {}){
                for (var i in this.editing){
                    this.editing[i] = null;
                }
                this.editing.is_enabled = true;
                this.isNew = true;
                this.editing_failed = false;
                this.$refs._modal.show();
            },

            async submit(){
                if (this.isNew){
                    //Submit New
                    var response = await $.callAPI(axios, "POST", "items/schdraft_categories", this.editing);
                }else{
                    //Submit Edit
                    var url = "items/schdraft_categories/"+encodeURI(this.editing.id);
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

        computed: {
        },

    }

</script>

<template>
    <div>

        <h1>時刻表編輯</h1>

        <div class="text-center">
            <b-button variant="success" @click="newItem()">
                <b-icon-plus scale="1.2"></b-icon-plus> 新增類別
            </b-button>
        </div>

        <!-- Table -->
        <div class="table-responsive mt-4">
            <table class="table table-hover my-table">
                <thead>
                    <tr class="thead-light">
                        <th></th>
                        <th>ID</th>
                        <th>類別</th>
                        <th>啟用?</th>
                        <th>備註</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, i) in data" :key="i">

                        <td class="text-left" style="width: 3rem;">
                            <b-button variant="outline-info" class="px-2 py-1" @click="editItem(item)">
                                <b-icon-pencil />
                            </b-button>
                        </td>
                        <td>{{item.id}}</td>
                        <td>
                            <nuxt-link :to="'/schdraft/category/'+encodeURI(item.id)">
                                {{item.title}}
                            </nuxt-link>
                        </td>
                        <td>{{item.is_enabled ? '✔️' : '❌'}}</td>
                        <td class="remarks">{{item.remarks}}</td>
                        <td class="text-right py-2">
                            <b-button variant="outline-danger" class="px-2 py-1" @click="removeItem(item)">
                                <b-icon-trash />
                            </b-button>
                        </td>

                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal for New / Edit Operator -->
        <b-modal ref="_modal" centered scrollable hide-footer
        :title="isNew ? '時刻表－新增類別' : '時刻表－編輯類別'">

            <div class="row">
                <div class="col-sm-4">ID</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.id" :disabled="!isNew" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">類別標題</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.title" @focus="editing_failed = false" />
                </div>
                <div class="col-12">類別備註<br/>
                    <b-form-textarea v-model="editing.remarks" rows="5" size="sm"
                    @focus="editing_failed = false" />
                </div>
                <div class="col-12">
                    <b-form-checkbox switch v-model="editing.is_enabled" @focus="editing_failed = false">
                        啟用類別
                    </b-form-checkbox>
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