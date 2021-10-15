<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');
    const sd = require('~/schdraft.js');

    import { BIcon, BIconPencil, BIconTrash, BIconPlus, BIconCaretDown, BIconClock } from 'bootstrap-vue'
    import TemplateEditor from '../../../components/schdraft/template-editor.vue';

    export default {

        layout: "dashboard",
        components: {
            BIcon, BIconPencil, BIconTrash, BIconPlus, BIconCaretDown, BIconClock,
            TemplateEditor,
        },

        data() {
            return {
                data_category: {},
                data_group: {},
                data_template: {},
            };
        },

        async mounted(){

            //Load Template Data (id & title only)
            var url = "items/schdraft_templates/"+encodeURI(this.$route.params.template_id);
            var response = await $.callAPI(axios, "GET", url, {
                sort: "id", fields: "title,id,group_id",
            });
            if (response.http_status != 200) return false;
            this.data_template = response.data;
            var group_id = response.data.group_id;

            //Load Group Data (id & title only)
            var url = "items/schdraft_groups/"+encodeURI(group_id);
            var response = await $.callAPI(axios, "GET", url, {
                sort: "id", fields: "title,id,category_id",
            });
            if (response.http_status != 200) return false;
            this.data_group = response.data;
            var category_id = response.data.category_id;

            //Load Category Data
            var url = "items/schdraft_categories/"+encodeURI(category_id);
            var response = await $.callAPI(axios, "GET", url, {
                sort: "id", fields: "*",
            });
            if (response.http_status != 200) return false;
            this.data_category = response.data;

        },

        methods: {
            displayTime: sd.displayTime,
            displaySignedInteger: $.displaySignedInteger,

            

        },

        computed: {
        },

    }

</script>

<template>
    <div>

        <b-breadcrumb>
            <b-breadcrumb-item to="/schdraft">時刻表編輯</b-breadcrumb-item>
            <b-breadcrumb-item :to="`/schdraft/category/${data_category.id}`">
                {{data_category.title}}
            </b-breadcrumb-item>
            <b-breadcrumb-item active>{{data_group.title}}</b-breadcrumb-item>
            <b-breadcrumb-item active>{{data_template.title}}</b-breadcrumb-item>
        </b-breadcrumb>

        <h1>{{data_template.title}} <small>({{data_template.id}})</small></h1>
        
        <template-editor :template-id="$route.params.template_id" not-in-modal />

    </div>
</template>