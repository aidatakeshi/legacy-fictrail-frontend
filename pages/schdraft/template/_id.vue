<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPen, BIconTrash } from 'bootstrap-vue'
    import EditSchdraftTemplate from '../../../components/schdraft/edit-schdraft-template.vue';

    import ListItem from '@/components/list-item';
    import EditItem from '@/components/edit-item';
    import ButtonNew from '@/components/button-new';
    import SelectItem from '@/components/select-item';

    export default {

        layout: "dashboard",
        components:{
            EditSchdraftTemplate,
            ListItem, EditItem, ButtonNew, SelectItem,
        },

        data() {
            return {
                breadcrumb: {},
                jump_template_id: null,
            }
        },

        async mounted(){
            //Load data of categories
            var $route = `items/schdraft_template/${encodeURIComponent(this.$route.params.id)}?breadcrumb=1`;
            var response = await $.callAPI(axios, 'GET', $route);
            if (response.http_status >= 400) return false;
            this.breadcrumb = response.data;
            this.jump_template_id = this.breadcrumb.id;
        },

        methods: {
            jumpToTemplate(){
                var $route = `/schdraft/template/${encodeURIComponent(this.jump_template_id)}`;
                this.$router.push($route);
            },
        },

    }

</script>

<template>
    <div class="my-4">
        <h2>{{breadcrumb.title}}</h2>

        <!-- Breadcrumb -->
        <div class="mt-2">
            <b-breadcrumb>
                <b-breadcrumb-item to="/schdraft">時刻表編輯</b-breadcrumb-item>
                <b-breadcrumb-item :to="`/schdraft/category/${encodeURI(breadcrumb.category_id)}`">
                    {{breadcrumb.category_title}}
                </b-breadcrumb-item>
                <b-breadcrumb-item :to="`/schdraft/category/${encodeURI(breadcrumb.category_id)}`">
                    {{breadcrumb.group_title}}
                </b-breadcrumb-item>
                <b-breadcrumb-item active>
                    {{breadcrumb.title}}
                </b-breadcrumb-item>
            </b-breadcrumb>
        </div>

        <!-- Jump to Another Template -->
        <b-card class="mb-2" body-class="row p-2">
            <div class="col-sm-4">
                跳到其他模板:
            </div>
            <div class="col-sm-8">
                <select-item type="schdraft_template of category" v-model="jump_template_id" size="sm"
                :filter="breadcrumb.category_id" @change="jumpToTemplate" />
            </div>
        </b-card>

        <!-- Main Content -->
        <edit-schdraft-template :id="$route.params.id" />

    </div>
</template>