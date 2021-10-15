<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

export default {
    
    props: {
        value: null,
    },

    data() {
        return {
            data_category: [],  //data_category[i]
            data_group: {},     //data_group[category_id][i]
            data_template: {},  //data_template[category_id][group_id][i]
            options_group: [],
            options_template: [],
            category_id: null,
            group_id: null,
            template_id: null,
        };
    },

    watch: {
        value(){
            this.load();
        },
    },

    async mounted(){
        //data_category
        this.data_category = await $.getItems(axios, "schdraft_categories", {
            filter: { is_enabled: true },
            fields: "id,title",
        });

        //data_group
        var results = await $.getItems(axios, "schdraft_groups", {
            filter: { is_enabled: true },
            fields: "id,title,category_id",
        });
        for (var i in results){
            var category_id = results[i].category_id;
            if (this.data_group[category_id] == null) this.data_group[category_id] = [];
            this.data_group[category_id].push(results[i]);
        }

        //data_template
        var results = await $.getItems(axios, "schdraft_templates", {
            filter: { is_enabled: true },
            fields: "id,title,group_id.id,group_id.category_id",
            sort: "is_upbound,id",
        });
        for (var i in results){
            var group_id = results[i].group_id.id;
            var category_id = results[i].group_id.category_id;
            if (this.data_template[category_id] == null) this.data_template[category_id] = {};
            if (this.data_template[category_id][group_id] == null) this.data_template[category_id][group_id] = [];
            this.data_template[category_id][group_id].push(results[i]);
        }

        //Load
        this.load();
        this.$forceUpdate();

    },

    methods: {
        changed(){
            this.$emit('input', this.template_id);
            this.$forceUpdate();
        },
        load(){
            for (var category_id in this.data_template){
                for (var group_id in this.data_template[category_id]){
                    for (var i in this.data_template[category_id][group_id]){
                        if (this.data_template[category_id][group_id][i].id == this.value){
                            this.category_id = category_id;
                            this.getGroupOptions();
                            this.group_id = group_id;
                            this.getTemplateOptions();
                            this.template_id = this.value;
                            return true;
                        }
                    }
                }
            }
        },
        getGroupOptions(){
            this.options_group = this.data_group?.[this.category_id]||[];
            this.$forceUpdate();
        },
        getTemplateOptions(){
            this.options_template = this.data_template?.[this.category_id]?.[this.group_id]||[];
            this.$forceUpdate();
        },

    },

}

</script>

<template>
    <div>

        <!-- Category -->
        <b-form-select v-model="category_id" @change="group_id = null; getGroupOptions(); changed();">
            <b-form-select-option :value="null">-- 請選擇分類 --</b-form-select-option>
            <b-form-select-option v-for="item in data_category" :key="item.id" :value="item.id">
                {{item.title}} ({{item.id}})
            </b-form-select-option>
        </b-form-select>

        <!-- Group -->
        <b-form-select v-model="group_id" @change="template_id = null; getTemplateOptions(); changed();">
            <b-form-select-option :value="null">-- 請選擇組別 --</b-form-select-option>
            <template v-if="category_id">
                <b-form-select-option v-for="item in options_group" :key="item.id" :value="item.id">
                    {{item.title}} ({{item.id}})
                </b-form-select-option>
            </template>
        </b-form-select>

        <!-- Template -->
        <b-form-select v-model="template_id" @change="changed();">
            <b-form-select-option :value="null">-- 請選擇模板 --</b-form-select-option>
            <template v-if="category_id && group_id">
                <b-form-select-option v-for="item in options_template"
                :key="item.id" :value="item.id">
                    {{item.title}} ({{item.id}})
                </b-form-select-option>
            </template>
        </b-form-select>

    </div>
</template>