<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPencil, BIconTrash, BIconPlus } from 'bootstrap-vue';
    import SelectOperator from '../../components/select-operator.vue';

    export default {

        layout: "dashboard",
        components: { BIcon, BIconPencil, BIconTrash, BIconPlus, SelectOperator },

        data() {
            return {
                data_line_types: {},
                data: {},
                isNew: false,
                filter: {
                    name: this.$route.query.name,
                    operator_id: this.$route.query.operator_id,
                },
                editing: {
                    line_type_id: null,
                    operator_id: null,
                    name_chi: null,
                    name_eng: null,
                    name_eng_short: null,
                    color: null,
                    color_text: null,
                    max_speed_kph: null,
                    remarks: null,
                },
                editing_line_type_id_original: null,
                editing_id: null,
                editing_failed: false,
                viewing_id: null,
                viewing_title: null,
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
                //Load Line Types
                this.data_line_types = await $.getItems(axios, "line_types", {
                    sort: "sort",
                    fields: "id, name_chi, name_eng",
                    array: true,
                });

                //Load Data By Line Types
                for (var i in this.data_line_types){
                    var type_id = this.data_line_types[i].id;
                    this.data[type_id] = [];
                    this.loadData(type_id);
                }
            },

            async loadData(type_id){
                this.data[type_id] = await $.getItems(axios, "lines", {
                    filter: {
                        line_type_id: type_id,
                        operator_id: this.$route.query.operator_id,
                    },
                    search: this.$route.query.name,
                    sort: 'name_eng',
                    fields: [
                        "id", "name_chi", "name_eng", "name_eng_short", "color",
                        "max_speed_kph", "length_km", "remarks",
                        "operator_id.id", "operator_id.name_chi", "operator_id.color",
                        "line_group_id.id", "line_group_id.name_chi",
                        'line_station_ids',
                    ],
                    array: true,
                });
                this.$forceUpdate();
            },

            updateSearch(){
                var url = '/lines?';
                for (var i in this.filter){
                    if (this.filter[i]) url += (i+'=' + encodeURI(this.filter[i])) + '&';
                }
                this.$router.push(url);
            },

            editItem(line, type){
                for (var i in this.editing){
                    this.editing[i] = line[i];
                }
                this.editing.operator_id = (line.operator_id || {}).id;
                this.editing.line_group_id = (line.line_group_id || {}).id;
                //
                this.editing.line_type_id = type.id;
                this.editing_line_type_id_original = type.id;
                this.editing_id = line.id;
                this.isNew = false;
                this.editing_failed = false;
                this.$refs._modal.show();
            },

            newItem(type = {}){
                for (var i in this.editing){
                    this.editing[i] = null;
                }
                //
                this.editing.line_type_id = type.id;
                this.editing_line_type_id_original = type.id;
                this.editing_id = null;
                this.isNew = true;
                this.editing_failed = false;
                this.$refs._modal.show();
            },
            
            async removeItem(line, type){
                if(!confirm("確定移除？")) return false;
                await $.callAPI(axios, "DELETE", "items/lines/"+encodeURI(line.id), {});
                this.loadData(type.id);
            },

            async submit(){
                if (this.isNew){
                    //Submit New
                    var response = await $.callAPI(axios, "POST", "items/lines", this.editing);
                }else{
                    //Submit Edit
                    var url = "items/lines/"+encodeURI(this.editing_id);
                    var response = await $.callAPI(axios, "PATCH", url, this.editing);
                }
                if (response.http_status >= 400){
                    //Failed
                    this.editing_failed = true;
                }else{
                    //Success
                    this.loadData(this.editing.line_type_id);
                    if (this.isNew || this.editing.line_type_id != this.editing_line_type_id_original){
                        this.loadData(this.editing_line_type_id_original);
                    }
                    this.$refs._modal.hide();
                }
            },

            viewLine(line){
                this.viewing_id = line.id;
                this.viewing_title = line.name_chi;
                this.$refs.line_modal.show();
            },

        }

    }

</script>

<template>
    <div>

        <h1>路線</h1>
        
        <div class="text-center">
            <b-button variant="success" @click="newItem()">
                <b-icon-plus scale="1.2"></b-icon-plus> 新增路線
            </b-button>
        </div>

        <!-- Search Box -->
        <b-card class="my-4">
            <div class="row">
                <div class="col-sm-6 col-lg-4">
                    路線名稱：<br/>
                    <input class="form-control" v-model="filter.name" @change="updateSearch()" placeholder="(無篩選)" />
                </div>
                <div class="col-sm-6 col-lg-4">
                    營運者：<br/>
                    <select-operator v-model="filter.operator_id" nullable @input="updateSearch()" />
                </div>
            </div>
        </b-card>

        <!-- List of Lines -->
        <div v-for="(type, i) in data_line_types" :key="i">
            <div v-if="data[type.id].length" class="mb-4">

                <h2>{{type.name_chi}} <small>{{type.name_eng}}</small></h2>

                <!-- Table -->
                <div class="table-responsive">
                    <table class="table table-hover my-table">
                        <thead class="thead-light">
                            <tr>
                                <th style="width: 3rem;"></th>
                                <th>營運者</th>
                                <th style="width: 1rem;"></th>
                                <th>路線名</th>
                                <th>簡稱</th>
                                <th>車站</th>
                                <th>長度</th>
                                <th>最高速度</th>
                                <th>路線組</th>
                                <th>備註</th>
                                <th style="width: 3rem;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(line, j) in data[type.id]" :key="j">
                                <td>
                                    <b-button variant="outline-info" class="px-2 py-1" @click="editItem(line, type)">
                                        <b-icon-pencil />
                                    </b-button>
                                </td>
                                <td>
                                    <color-box :color="(line.operator_id||{}).color"></color-box>
                                    <strong>{{(line.operator_id||{}).name_chi}}</strong>
                                </td>
                                <td>
                                    <color-box :color="line.color"></color-box>
                                </td>
                                <td class="text-left" style="line-height: 1rem;">
                                    <strong>
                                        {{line.name_chi}}<br/><small>{{line.name_eng}}</small>
                                    </strong>
                                </td>
                                <td>{{line.name_eng_short || '-'}}</td>
                                <td class="text-center">
                                    <b-button variant="outline-secondary" class="px-2 py-1" style="min-width: 2em;"
                                    @click="viewLine(line)" v-if="(line.line_station_ids||[]).length">
                                        {{(line.line_station_ids||[]).length}}
                                    </b-button>
                                    <span v-else>-</span>
                                </td>
                                <td>
                                    <span v-if="line.length_km">{{line.length_km}} km</span>
                                    <span v-else>-</span>
                                </td>
                                <td>{{line.max_speed_kph}} km/h</td>
                                <td>{{(line.line_group_id || {}).name_chi || '-'}}</td>
                                <td class="remarks">{{line.remarks}}</td>
                                <td>
                                    <b-button variant="outline-danger" class="px-2 py-1" @click="removeItem(line, type)">
                                        <b-icon-trash />
                                    </b-button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="text-center">
                    <b-button variant="info" @click="newItem(type)">
                        <b-icon-plus scale="1.2"></b-icon-plus> 新增路線
                    </b-button>
                </div>

            </div>
        </div>
        
        <!-- Modal for New / Edit Operator -->
        <b-modal ref="_modal" centered scrollable hide-footer
        :title="isNew ? '新增路線' : '編輯路線'">

            <div class="mb-2"><strong>路線種類：{{editing.line_type_id}}</strong></div>

            <div class="row">
                <div class="col-sm-4">路線種類</div>
                <div class="col-sm-8">
                    <select-line-type v-model="editing.line_type_id" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">營運者</div>
                <div class="col-sm-8">
                    <select-operator v-model="editing.operator_id" @focus="editing_failed = false" />
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
                <div class="col-sm-4">路線組</div>
                <div class="col-sm-8">
                    <select-line-group v-model="editing.line_group_id" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">最高速度 (km/h)</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.max_speed_kph" @focus="editing_failed = false" />
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

        <!-- Modal for Viewing Line -->
        <b-modal ref="line_modal" centered scrollable hide-footer :title="viewing_title" size="xl">
            <lines-view-stations :line-id="viewing_id" v-if="viewing_id" />
        </b-modal>
        
        <!------------------------------------------------------------------------------------->

    </div>
</template>