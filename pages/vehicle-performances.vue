<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPencil, BIconPlus, BIconLayers, BIconGraphDown, BIconTrash } from 'bootstrap-vue'

    export default {

        layout: "dashboard",
        components: { BIcon, BIconPencil, BIconPlus, BIconLayers, BIconGraphDown, BIconTrash },

        data() {
            return {
                data_groups: {},
                data_items: {},
                isNew: false,
                isCopy: false,
                editing_group: {
                    id: null,
                    name_chi: null,
                    name_eng: null,
                    remarks: null,
                    sort: null,
                },
                editing_item_id: null,
                editing_item_group_id: null,
                editing_failed: false,
                viewing_item_id: null,
            }
        },

        async mounted(){

            //Load VP Groups
            this.loadVPGroups();

            //Load VP Items
            this.loadVPItems();

        },

        methods: {

            async loadVPGroups(){
                //Get Data
                this.data_groups = await $.getItems(axios, "vehicle_performance_groups", {
                    fields: "id, name_chi, name_eng, remarks, sort",
                    sort: "sort",
                });
            },

            async loadVPItems(group_id = null){
                //Get Data
                var results = await $.getItems(axios, "vehicle_performance_items/", {
                    filter: group_id ? {group_id: group_id} : {},
                    fields: "id, group_id, name_chi, name_eng, max_speed_kph, max_accel_kph_s, motor_ratio, motor_rated_kw, has_calc_results, remarks",
                    array: true,
                });
                //Fill up data_items[id]
                if (group_id){
                    this.data_items[group_id] = results;
                }else{
                    for (var i in results){
                        var id = results[i].group_id;
                        if (this.data_items[id] == null) this.data_items[id] = [];
                        this.data_items[id].push(results[i]);
                    }
                }
                this.$forceUpdate();
            },

            editGroup(group){
                for (var i in this.editing_group){
                    this.editing_group[i] = group[i];
                }
                //
                this.isNew = false;
                this.editing_failed = false;
                this.$refs.group_modal.show();
            },

            newGroup(){
                for (var i in this.editing_group){
                    this.editing_group[i] = null;
                }
                //
                this.isNew = true;
                this.editing_failed = false;
                this.$refs.group_modal.show();
            },

            editItem(item, group, isCopy = false){
                this.isNew = false;
                this.isCopy = isCopy;
                this.editing_item_id = item.id;
                this.editing_item_group_id = group.id;
                this.$refs.item_modal.show();
            },

            newItem(group){
                this.isNew = true;
                this.editing_item_id = null;
                this.editing_item_group_id = group.id;
                this.$refs.item_modal.show();
            },
            
            async removeItem(item, group){
                if(!confirm("確定移除？")) return false;
                await $.callAPI(axios, "DELETE", "items/vehicle_performance_items/"+encodeURI(item.id), {});
                this.loadVPItems(group.id);
            },

            async submitGroup(){
                if (this.isNew){
                    //Submit New
                    var response = await $.callAPI(axios, "POST", "items/vehicle_performance_groups", this.editing_group);
                }else{
                    //Submit Edit
                    var url = "items/vehicle_performance_groups/"+encodeURI(this.editing_group.id);
                    var response = await $.callAPI(axios, "PATCH", url, this.editing_group);
                }
                if (response.http_status >= 400){
                    //Failed
                    this.editing_failed = true;
                }else{
                    //Success
                    this.loadVPGroups();
                    this.$refs.group_modal.hide();
                }
            },

            itemSubmitted(data){
                var group1 = this.editing_item_group_id;
                var group2 = data.group_id;
                this.loadVPItems(group1);
                if (group2 != group1) this.loadVPItems(group2);
                this.$refs.item_modal.hide();
            },

            viewCalcResults(item){
                this.viewing_item_id = item.id;
                this.$refs.calc_result_modal.show();
            },

        },

        computed: {
        },

    }

</script>

<template>
    <div>

        <h1>車輛性能</h1>
            
        <div class="text-center">
            <b-button variant="success" @click="newGroup()">
                <b-icon-plus /> 新增組別
            </b-button>
        </div>

        <!-- List of Operators -->
        <b-card class="my-4" v-for="(group, i) in data_groups" :key="i">

            <h2>{{group.name_chi}} <small>({{group.id}})</small></h2>
            <pre v-if="group.remarks">{{group.remarks}}</pre>

            <div class="table-responsive">
                <table class="table table-hover my-table">
                    <thead class="thead-light">
                        <tr>
                            <th style="width: 3rem;"></th>
                            <th>名稱</th>
                            <th>最高速度</th>
                            <th>起動加速度</th>
                            <th>動力比例</th>
                            <th>定格出力</th>
                            <th>備註</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody v-if="(data_items[group.id]||[]).length">
                        <tr v-for="(item, j) in data_items[group.id]" :key="j">
                            <td>
                                <b-button variant="outline-info" class="px-2 py-1" @click="editItem(item, group)">
                                    <b-icon-pencil />
                                </b-button>
                                <template v-if="item.has_calc_results">
                                    <b-button variant="outline-secondary" class="px-2 py-1" @click="viewCalcResults(item)">
                                        <b-icon-graph-down />
                                    </b-button>
                                </template>
                            </td>
                            <td class="text-left">
                                <strong>{{item.name_chi}}</strong>
                                <div style="font-size: 0.8rem;">({{item.id}})</div>
                            </td>
                            <td>{{parseFloat(item.max_speed_kph).toFixed(0)}} km/h</td>
                            <td>{{parseFloat(item.max_accel_kph_s).toFixed(2)}} km/h/s</td>
                            <td>{{parseFloat(item.motor_ratio).toFixed(1)}} %</td>
                            <td>{{parseFloat(item.motor_rated_kw).toFixed(0)}} kW</td>
                            <td class="remarks">{{item.remarks}}</td>
                            <td class="text-right">
                                <b-button variant="outline-info" class="px-2 py-1" @click="editItem(item, group, true)">
                                    <b-icon-layers />
                                </b-button>
                                <b-button variant="outline-danger" class="px-2 py-1" @click="removeItem(item, group)">
                                    <b-icon-trash />
                                </b-button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="text-center mb-2">
                <b-button variant="outline-info" @click="newItem(group)">
                    <b-icon-plus /> 新增項目
                </b-button>
                <b-button variant="info" @click="editGroup(group)">
                    <b-icon-pencil /> 編輯組別
                </b-button>
            </div>

            <div class="text-secondary text-right" style="font-size: 80%;">排序：{{group.sort}}</div>

        </b-card>

        <!-- Modal for New / Edit Item -->
        <b-modal ref="item_modal" centered scrollable hide-footer size="xl"
        :title="isNew ? '新增項目' : isCopy ? '複製項目' : '編輯項目'">
            <vehicle-performances-edit-item
                :item-id="editing_item_id" :group-id="editing_item_group_id" :is-new="isNew" :is-copy="isCopy"
                @submit="itemSubmitted"
            />
        </b-modal>

        <!-- Modal for Viewing Calc Results -->
        <b-modal ref="calc_result_modal" centered scrollable hide-footer size="xl" title="計算結果">
            <vehicle-performances-view-calc-result :item-id="viewing_item_id" />
        </b-modal>

        <!-- Modal for New / Edit Group -->
        <b-modal ref="group_modal" centered scrollable hide-footer :title="isNew ? '新增組別' : '編輯組別'">

            <div class="row">
                <div class="col-sm-4">ID</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing_group.id" :disabled="!isNew" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">中文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing_group.name_chi" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">英文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing_group.name_eng" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">排序</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing_group.sort" @focus="editing_failed = false" />
                </div>
                <div class="col-12">
                    備註<br/>
                    <b-form-textarea v-model="editing_group.remarks" size="sm" rows="5"
                    @focus="editing_failed = false" />
                </div>
            </div>
            
            <div class="text-center">
                <div class="text-danger" v-if="editing_failed">提交失敗</div>
            </div>

            <b-button variant="primary" block class="mt-2" @click="submitGroup">提交</b-button>

        </b-modal>

        <!------------------------------------------------------------------------------------->

    </div>
</template>