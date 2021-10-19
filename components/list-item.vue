<script>

/**
 * List Item (Generic Use)
 */

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const config = require('~/config.list-item.js');
const env = require('~/config.js');

import { BIcon, BIconPen, BIconX, BIconCheck } from 'bootstrap-vue'

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconCheck,
    },
    props: {
        type: null,
        nullable: Boolean,
        limit: null,
        query: Object,
        query2: Object,
        data: Array, //Input data. If null, then API is called inside
        trigger: null,
    },
    data() {
        return {
            data$: [],
            count: null,
            page: null,
            limit_b: null,
            configOfList: {},
        };
    },
    watch: {
        trigger(){
            this.page = 1;
            this.reload();
        },
    },
    mounted(){
        this.page = 1;
        this.reload();
    },
    methods:{
        //Reload
        async reload(){
            //Get Config of Type
            if (!config.data[this.type]) return false;
            this.configOfList = config.data[this.type].list;
            //If not external data, call API to get data
            if (this.data === null || this.data === undefined){
                //Prepare Query
                var query = Object.assign((this.query||{}), (this.query2||{}));
                query.page = this.page;
                query.limit = this.limit;
                //Call API
                var response = await $.callAPI(axios, 'GET', 'items/'+this.type, query);
                if (response.http_response >= 400) return false;
                this.data$ = response.data;
                this.page = response.page;
                this.limit_b = response.limit;
                this.count = response.count;
            }
            //Otherwise, use prop data
            else{
                this.data$ = this.data;
            }
        },

        //Remove Item
        async removeItem(id){
            var c = confirm(`確認移除? (ID = ${id})`);
            if (!c) return false;
            var route = 'items/'+this.type+'/'+encodeURIComponent(id);
            var response = await $.callAPI(axios, 'DELETE', route, {});
            if (response.http_response >= 400) return false;
            this.$emit('removed', id);
            this.$emit('change', id);
        },

        //Pagination
        pageClicked(event, page){
            this.page = page;
            this.reload();
        },
        jumpToPage(){
            var page = parseInt(prompt("請輸入頁數："));
            if (isNaN(page) || page == null) return false;
            if (page < 1) page = 1;
            var pages = Math.ceil(this.count / this.limit);
            if (page > pages) page = pages;
            this.page = page;
            this.reload();
        },

        //Number Display
        decimals(number, decimals){
            var num = number * 1;
            if (isNaN(num)) return number;
            if (decimals === null) return number;
            return num.toFixed(decimals);
        },

        //Image URL
        image_url(key){
            return `${env.API_BASE_URL}/file/${key}`;
        },
        //Image Style
        image_style(listConfig){
            var obj = {};
            if (listConfig.width) obj['max-width'] = listConfig.width;
            if (listConfig.height) obj['max-height'] = listConfig.height;
            return obj;
        }
    },
}
</script>

<template>
    <div>
        <div class="table-responsive">

            <!-- Pagination -->
            <div v-if="page" class="d-flex justify-content-between align-items-center flex-wrap">
                <div class="my-2" @click="jumpToPage()"><strong>共有{{count}}項結果：</strong></div>
                <b-pagination v-model="page" :total-rows="count" :per-page="limit_b" v-if="count > limit_b"
                    first-number last-number
                    @page-click="pageClicked"
                ></b-pagination>
            </div>

            <!-- The Table -->
            <table class="table table-hover my-table" v-if="configOfList">
                <!-- Header ------------------------------------------------------------>
                <thead>
                    <tr class="thead-light">
                        <th class="col-button"></th>
                        <th v-for="(listConfig, i) in configOfList" :key="i">{{listConfig.label}}</th>
                        <th class="col-button"></th>
                    </tr>
                </thead>
                <!-- Body -------------------------------------------------------------->
                <tbody>
                    <tr v-for="(item, j) in data$" :key="j">
                        <!-- Edit Button -->
                        <td class="buttons">
                            <b-button variant="outline-info" @click="$emit('edit', item.id)">
                                <b-icon-pen />
                            </b-button>
                        </td>
                        <!----------------------->
                        <template v-for="(listConfig, i) in configOfList">
                            <!-- Name -->
                            <td :key="i" v-if="listConfig.format == 'name'" class="name">
                                {{item[listConfig.field]}}
                                <small v-if="listConfig.field_bracket">
                                    ({{item[listConfig.field_bracket]}})
                                </small>
                                <template v-if="listConfig.field_sub">
                                    <br/>
                                    <small v-if="listConfig.field_sub">
                                        {{item[listConfig.field_sub]}}
                                    </small>
                                    <small v-if="listConfig.field_sub_bracket">
                                        ({{item[listConfig.field_sub_bracket]}})
                                    </small>
                                </template>
                            </td>
                            <!-- Remarks -->
                            <td :key="i" v-else-if="listConfig.format == 'remarks'" class="remarks"><!---
                            --->{{item[listConfig.field]}}<!---
                        ---></td>
                            <!-- ID -->
                            <td :key="i" v-else-if="listConfig.format == 'id'">
                                <b-badge>{{item[listConfig.field]}}</b-badge>
                            </td>
                            <!-- Color -->
                            <td :key="i" v-else-if="listConfig.format == 'color'" class="color">
                                <color-box :color="item[listConfig.field]"></color-box>
                            </td>
                            <!-- Image -->
                            <td :key="i" v-else-if="listConfig.format == 'image'">
                                <img v-if="item[listConfig.field]"
                                :src="image_url(item[listConfig.field])"
                                :style="image_style(listConfig)" />
                            </td>
                            <!--Boolean -->
                            <td :key="i" v-else-if="listConfig.format == 'boolean'">
                                <span class="text-success" v-if="item[listConfig.field]">
                                    <b-icon-check scale="1.5" />
                                </span>
                                <span class="text-danger" v-else>
                                    <b-icon-x scale="1.5" />
                                </span>
                            </td>
                            <!--Number -->
                            <td :key="i" v-else-if="listConfig.format == 'number'">
                                {{decimals(item[listConfig.field], listConfig.decimals)}}
                                <small v-if="listConfig.unit">{{listConfig.unit}}</small>
                            </td>
                            <!-- Default -->
                            <td :key="i" v-else>
                                {{item[listConfig.field]}}
                            </td>
                            <!----------------------->
                        </template>
                        <!-- Delete Button -->
                        <td class="buttons">
                            <b-button variant="outline-danger">
                                <b-icon-x scale="1.5" @click="removeItem(item.id)" />
                            </b-button>
                        </td>
                        <!----------------------->
                    </tr>
                </tbody>
                <!---------------------------------------------------------------------->
            </table>

            <!-- Another Pagination -->
            <div v-if="page" class="d-flex justify-content-between align-items-center flex-wrap">
                <div class="my-2"></div>
                <b-pagination v-model="page" :total-rows="count" :per-page="limit_b" v-if="count > limit_b"
                    first-number last-number
                    @page-click="pageClicked"
                ></b-pagination>
            </div>

        </div>
    </div>
</template>