<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconX, BIconPlus } from 'bootstrap-vue'

export default {
    components: { BIcon, BIconX, BIconPlus },
    
    props: {
        value: null,
        type: String,
        sort: String,
        subType: String,
        subSort: String,
        foreignId: String,
        operatorAttr: String,
    },

    data() {
        return {
            data: [],
            subData: {},
            display: null,
            display_color_bg: null,
            display_color_text: null,
        };
    },

    watch: {
        value(){
            this.changeDisplay();
        },
    },

    async mounted(){
        var op = this.operatorAttr;
        //Mother Type
        var response = await $.callAPI(axios, "GET", "items/"+encodeURI(this.type), {
            sort: this.sort || 'id',
            fields: 'id, name_chi, name_eng, name, color, color_text'
            + (!op & !this.subType && this.subType ? '' : `, ${op}.*`),
            limit: -1,
        });
        if (response.http_status == 200){
            this.data = response.data;
            for (var i in this.data) this.subData[this.data[i].id] = [];
        }
        //Children Type
        if (this.subType){
            var response = await $.callAPI(axios, "GET", "items/"+encodeURI(this.subType), {
                sort: this.subSort || 'id',
                fields: 'id, name_chi, name_eng, name, color, color_text, ' + this.foreignId
                + (!op ? '' : `, ${op}.*`),
                limit: -1,
            });
            if (response.http_status == 200){
                for (var i in response.data){
                    var foreignId = response.data[i][this.foreignId];
                    this.subData[foreignId].push(response.data[i]);
                }
            }
        }
        //Display
        this.changeDisplay();
        this.$forceUpdate();
    },

    methods: {
        //Change Display
        changeDisplay(){
            this.display = '(未選擇)';
            this.display_color_bg = null;
            this.display_color_text = null;
            //Mother Type
            if (!this.subType){
                for (var i in this.data){
                    if (this.data[i].id == this.value){
                        var item = this.data[i];
                        this.display = item.name_chi || item.name;
                        if (item.color_text){
                            this.display_color_bg = item.color;
                            this.display_color_text = item.color_text;
                        }
                        break;
                    }
                }
            }
            //Sub Type
            else{
                for (var i in this.subData){
                    for (var j in this.subData[i]){
                        if (this.subData[i][j].id == this.value){
                            var item = this.subData[i][j];
                            this.display = item.name_chi || item.name;
                            if (item.color_text){
                                this.display_color_bg = item.color;
                                this.display_color_text = item.color_text;
                            }
                            break;
                        }
                    }
                }
            }
        },

        //Select Item
        selectItem(item){
            this.$emit('input', item.id);
            this.$emit('change');
            this.$refs._modal.hide();
        },

        //Select Null
        selectNull(){
            this.$emit('input', null);
            this.$emit('change');
            this.$refs._modal.hide();
        }
    },

    computed:{
        style: function(){
            return {
                'background-color': this.display_color_bg || 'white',
                'color': this.display_color_text || 'black',
            };
        },
    },

}

</script>

<template>
    <div>
        <input class="form-control text-center" :style="style" readonly :value="display" @click="$refs._modal.show()" />
        <b-modal ref="_modal" hide-header hide-footer centered>
            <div class="text-right">
                <b-button variant="link" class="p-2 mt-n3 mr-n3 text-secondary"
                @click="$refs._modal.hide()">
                    <b-icon-x scale="1.2" />
                </b-button>
            </div>
            <!-- Type 1: With SubType -->
            <template v-if="subType">
                <b-list-group>
                    <b-list-group-item button class="py-1" @click="selectNull()" :active="!value">
                        (不選擇)
                    </b-list-group-item>
                </b-list-group>
                <div v-for="(category, i) in data" :key="i" :hidden="!subData[category.id].length">
                    <strong>{{category.name_chi || category.name}}</strong>
                    <b-list-group>
                        <b-list-group-item button class="py-1" @click="selectItem(item)"
                        v-for="(item, j) in subData[category.id]" :key="j"
                        :active="item.id == value">
                            <color-box :color="item.color" v-if="item.color !== undefined"></color-box>
                            {{item.name_chi || item.name}}
                            <small v-if="item.name_eng">({{item.name_eng}})</small>
                            <small v-if="operatorAttr && item[operatorAttr]">
                                ({{item[operatorAttr].name_chi}})
                            </small>
                        </b-list-group-item>
                    </b-list-group>
                </div>
            </template>
            <!-- Type 2: Without SubType -->
            <template v-else>
                <b-list-group>
                    <b-list-group-item button class="py-1" @click="selectNull()" :active="!value">
                        (不選擇)
                    </b-list-group-item>
                    <b-list-group-item button class="py-1" v-for="(item, i) in data" :key="i" @click="selectItem(item)"
                    :active="item.id == value">
                        <color-box :color="item.color" v-if="item.color !== undefined"></color-box>
                        {{item.name_chi || item.name}}
                        <small v-if="item.name_eng">({{item.name_eng}})</small>
                        <small v-if="operatorAttr && item[operatorAttr]">
                            ({{item[operatorAttr].name_chi}})
                        </small>
                    </b-list-group-item>
                </b-list-group>
            </template>
            <!-------------------------------->
        </b-modal>
    </div>
</template>