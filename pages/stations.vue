<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPencil, BIconPlus, BIconTrash } from 'bootstrap-vue'
import SelectPrefecture from '../components/select-prefecture.vue';

    const calc = require('~/map-new-calc.js');

    export default {

        layout: "dashboard",
        components: { BIcon, BIconPencil, BIconPlus, BIconTrash, SelectPrefecture },

        data() {
            return {
                data: {},
                data_prefectures: {},
                page: 1,
                count: 0,
                limit: 25,
                filter: {
                    operator_id: this.$route.query.operator_id,
                    prefecture_id: this.$route.query.prefecture_id,
                    name: this.$route.query.name,
                },
                editing: {
                    operator_id: null,
                    name_chi: null,
                    name_eng: null,
                    prefecture_id: null,
                    height_m: null,
                    major: null,
                    tracks: null,
                    other_info: null,
                    is_signal_only: null,
                    is_abandoned: null,
                    remarks: null,
                },
                editing_id: null,
                editing_failed: false,
                editing_type: {},
            }
        },

        mounted(){
            this.init();
        },

        watchQuery(){
            this.init();
        },

        methods: {

            async init(){
                //Load Prefectures
                this.data_prefectures = await $.getItems(axios, "prefectures");

                //Load Data
                this.loadData();
            },

            async loadData(){
                var filter = {
                    operator_id: this.$route.query.operator_id,
                    prefecture_id: this.$route.query.prefecture_id,
                };
                var sort = 'name_eng';
                var response = await $.callAPI(axios, "GET", "items/stations", {
                    filter: filter,
                    search: this.$route.query.name,
                    limit: this.limit,
                    page: this.page,
                    meta: 'filter_count',
                    sort: sort,
                    fields: [
                        "*", "operator_id.id", "operator_id.name_chi", "operator_id.color",
                    ].join(','),
                });
                if (response.http_status != 200) return false;
                this.count = response.meta.filter_count;
                this.data = response.data;
                this.$forceUpdate();
            },

            updateSearch(){
                var url = '/stations?';
                for (var i in this.filter){
                    if (this.filter[i]) url += (i+'=' + encodeURI(this.filter[i])) + '&';
                }
                this.$router.push(url);
            },

            pageChanged(id, page){
                this.page = page;
                this.loadData();
            },

            editItem(station){
                for (var i in this.editing){
                    this.editing[i] = station[i];
                }
                this.editing.operator_id = (station.operator_id || {}).id;
                //
                this.editing_id = station.id;
                this.editing_failed = false;
                this.$refs._modal.show();
            },

            async submit(){
                if (false){
                }else{
                    //Submit Edit
                    var url = "items/stations/"+encodeURI(this.editing_id);
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

            displayLocation(x, y){
                if (!x || !y) return 'N/A';
                var ll = calc.getLatLonFromXY(x, y);
                var lat = parseFloat(ll.lat).toFixed(4);
                var lon = parseFloat(ll.lon).toFixed(4);
                return lat + "°N, " + lon + "°E";
            },

        }

    }

</script>

<template>
    <div>

        <h1>車站</h1>

        <!-- Search Box -->
        <b-card class="my-4">
            <div class="row">
                <div class="col-sm-6 col-lg-4">
                    車站名稱：<br/>
                    <input class="form-control" v-model="filter.name" @change="updateSearch()" placeholder="(無篩選)" />
                </div>
                <div class="col-sm-6 col-lg-4">
                    營運者：<br/>
                    <select-operator v-model="filter.operator_id" nullable @input="updateSearch()" />
                </div>
                <div class="col-sm-6 col-lg-4">
                    都省府縣：<br/>
                    <select-prefecture v-model="filter.prefecture_id" nullable @input="updateSearch()" />
                </div>
            </div>
        </b-card>

        <!-- List of Stations -->
        <pagination-wrapper id="pagination" :page="page" :count="count" :limit="limit" @page-clicked="pageChanged">

            <div class="table-responsive">
                <table class="table table-hover my-table">
                    <thead class="thead-light">
                        <tr>
                            <th style="width: 3rem;"></th>
                            <th>主要營運者</th>
                            <th>車站名</th>
                            <th>都省府縣</th>
                            <th>主要</th>
                            <th>信號</th>
                            <th>廢止</th>
                            <th>月台/軌道</th>
                            <th>位置</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(station, i) in data" :key="i">
                            <td>
                                <b-button variant="outline-info" class="px-2 py-1" @click="editItem(station)">
                                    <b-icon-pencil />
                                </b-button>
                            </td>
                            <td>
                                <color-box :color="(station.operator_id||{}).color"></color-box>
                                <strong>{{(station.operator_id||{}).name_chi}}</strong>
                            </td>
                            <td style="line-height: 1rem;">
                                <strong>
                                    {{station.name_chi}}<br/><small>{{station.name_eng}}</small>
                                </strong>
                            </td>
                            <td>
                                {{(data_prefectures[station.prefecture_id]||{}).name_chi}}<!---
                            --->{{(data_prefectures[station.prefecture_id]||{}).name_chi_suffix}}
                            </td>
                            <td>{{station.major ? '✔️' : '❌'}}</td>
                            <td>{{station.is_signal_only ? '✔️' : '❌'}}</td>
                            <td>{{station.is_abandoned ? '✔️' : '❌'}}</td>
                            <td>{{(station.tracks||[]).length}}個</td>
                            <td style="line-height: 1rem;">
                                <div><small>{{displayLocation(station.x, station.y)}}</small></div>
                                <div v-if="station.height_m"><small>▲{{station.height_m}}m</small></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </pagination-wrapper>
        
        <!-- Modal for New / Edit Operator -->
        <b-modal ref="_modal" centered scrollable hide-footer title="編輯車站">

            <div class="row">
                <div class="col-sm-4">中文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_chi" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">英文名稱</div>
                <div class="col-sm-8">
                    <b-form-input type="text" v-model="editing.name_eng" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">主要營運者</div>
                <div class="col-sm-8">
                    <select-operator v-model="editing.operator_id" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">所在都省府縣</div>
                <div class="col-sm-8">
                    <select-prefecture v-model="editing.prefecture_id" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">主要車站</div>
                <div class="col-sm-8">
                    <b-checkbox class="my-1" switch v-model="editing.major" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">海拔 (m)</div>
                <div class="col-sm-8">
                    <b-form-input type="number" v-model="editing.height_m" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">月台/軌道編號</div>
                <div class="col-sm-8">
                    <input-track-number v-model="editing.tracks" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">信號站</div>
                <div class="col-sm-8">
                    <b-checkbox class="my-1" switch v-model="editing.is_signal_only" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">廢止站</div>
                <div class="col-sm-8">
                    <b-checkbox class="my-1" switch v-model="editing.is_abandoned" @focus="editing_failed = false" />
                </div>
                <div class="col-sm-4">備註</div>
                <div class="col-sm-8">
                    <b-textarea rows="5" v-model="editing.remarks" @focus="editing_failed = false" />
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