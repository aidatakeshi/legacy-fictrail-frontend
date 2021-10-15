<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPencil, BIconTrash, BIconPlus, BIconCaretDown } from 'bootstrap-vue'

    export default {

        layout: "dashboard",
        components: { BIcon, BIconPencil, BIconTrash, BIconPlus, BIconCaretDown },

        data() {
            return {
                data_operator_types: {},
                data_operators: {},
                isNew: false,
                editing: {
                    id: null,
                    operator_type_id: null,
                    name_chi: null,
                    name_eng: null,
                    name_eng_short: null,
                    color: null,
                    color_text: null,
                    remarks: null,
                },
                editing_operator_type_id_original: null,
                editing_failed: false,
                editing_type: {},
                operator_selected: {},
            }
        },

        async mounted(){
            //Load operator types
            this.data_operator_types = await $.getItems(axios, 'operator_types', {
                sort: 'id',
            });

            //Load operators by operator types
            for (var i in this.data_operator_types){
                var type_id = this.data_operator_types[i].id;
                this.data_operators[type_id] = [];
                this.loadOperatorsData(type_id);
            }
        },

        methods: {
            async loadOperatorsData(type_id){
                this.data_operators[type_id] = await $.getItems(axios, 'operators', {
                    filter: {operator_type_id: type_id},
                    sort: 'name_eng',
                });
                this.$forceUpdate();
            },

            editItem(operator, type){
                for (var i in this.editing){
                    this.editing[i] = operator[i];
                }
                this.editing_operator_type_id_original = type.id;
                this.editing_type = type;
                this.isNew = false;
                this.editing_failed = false;
                this.$refs._modal.show();
            },

            async removeItem(operator, type){
                if(!confirm("確定移除？")) return false;
                await $.callAPI(axios, "DELETE", "items/operators/"+encodeURI(operator.id), {});
                this.loadOperatorsData(type.id);
            },

            newItem(type = {}){
                for (var i in this.editing){
                    this.editing[i] = null;
                }
                this.editing_operator_type_id_original = type.id;
                this.editing.operator_type_id = type.id;
                this.editing_type = type;
                this.isNew = true;
                this.editing_failed = false;
                this.$refs._modal.show();
            },

            async submit(){
                if (this.isNew){
                    //Submit New
                    var response = await $.callAPI(axios, "POST", "items/operators", this.editing);
                }else{
                    //Submit Edit
                    var url = "items/operators/"+encodeURI(this.editing.id);
                    var response = await $.callAPI(axios, "PATCH", url, this.editing);
                }
                if (response.http_status >= 400){
                    //Failed
                    this.editing_failed = true;
                }else{
                    //Success
                    this.loadOperatorsData(this.editing.operator_type_id);
                    if (!this.isNew && this.editing_operator_type_id_original != this.editing.operator_type_id){
                        this.loadOperatorsData(this.editing_operator_type_id_original);
                    }
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

        <h1>營運者</h1>

        <div class="text-center">
            <b-button variant="success" @click="newItem()">
                <b-icon-plus scale="1.2"></b-icon-plus> 新增營運者
            </b-button>
        </div>

        <!-- List of Operators -->
        <div v-for="(type, i) in data_operator_types" :key="i" :title="type.name_chi" class="mt-2 mb-4">

            <h2>{{type.name_chi}} <small>{{type.name_eng}}</small></h2>

            <!-- Table -->
            <div class="table-responsive">
                <table class="table table-hover my-table">
                    <thead>
                        <tr class="thead-light">
                            <th></th>
                            <th style="width: 1rem;"></th>
                            <th>名稱</th>
                            <th>簡稱</th>
                            <th>ID</th>
                            <th>備註</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(operator, j) in data_operators[type.id]" :key="j">

                            <td class="text-left" style="width: 3rem;">
                                <b-button variant="outline-info" class="px-2 py-1" @click="editItem(operator, type)">
                                    <b-icon-pencil />
                                </b-button>
                                <b-button variant="outline-secondary" class="px-2 py-1"
                                @click="operator_selected = operator; $refs.link_modal.show()">
                                    <b-icon-caret-down />
                                </b-button>
                            </td>
                            <td>
                                <strong>
                                    <color-box :color="operator.color"></color-box>
                                </strong>
                            </td>
                            <td class="text-left" style="line-height: 1rem;">
                                <strong>
                                    {{operator.name_chi}}<br/>
                                    <small>{{operator.name_eng}}</small>
                                </strong>
                            </td>
                            <td>{{operator.name_eng_short}}</td>
                            <td>{{operator.id}}</td>
                            <td class="remarks">{{operator.remarks}}</td>
                            <td class="text-right py-2">
                                <b-button variant="outline-danger" class="px-2 py-1" @click="removeItem(operator, type)">
                                    <b-icon-trash />
                                </b-button>
                            </td>

                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="text-center">
                <b-button variant="info" @click="newItem(type)">
                    <b-icon-plus scale="1.2"></b-icon-plus> 新增營運者
                </b-button>
            </div>

        </div>

        <!-- Modal for New / Edit Operator -->
        <b-modal ref="_modal" centered scrollable hide-footer
        :title="isNew ? '新增營運者' : '編輯營運者'">

            <div class="row">
                <div class="col-sm-4">營運者種類</div>
                <div class="col-sm-8">
                    <select-operator-type v-model="editing.operator_type_id" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">ID</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.id" :disabled="!isNew" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">中文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_chi" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">英文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_eng" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">簡稱</div>
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

        <!-- Modal for Links -->
        <b-modal ref="link_modal" centered scrollable hide-footer hide-header size="sm">
            <h5>
                <color-box :color="operator_selected.color"></color-box>
                {{operator_selected.name_chi}}
            </h5>
            <hr/>
            <nuxt-link :to="'/lines?operator_id='+encodeURI(operator_selected.id)">
                <b-button block variant="secondary" class="mt-2">路線</b-button>
            </nuxt-link>
            <nuxt-link :to="'/stations?operator_id='+encodeURI(operator_selected.id)">
                <b-button block variant="secondary" class="mt-2">車站</b-button>
            </nuxt-link>
            <nuxt-link :to="'/train-types?operator_id='+encodeURI(operator_selected.id)">
                <b-button block variant="secondary" class="mt-2">列車種別</b-button>
            </nuxt-link>
            <nuxt-link :to="'/train-names?operator_id='+encodeURI(operator_selected.id)">
                <b-button block variant="secondary" class="mt-2">列車名稱</b-button>
            </nuxt-link>

        </b-modal>

        <!------------------------------------------------------------------------------------->

    </div>
</template>