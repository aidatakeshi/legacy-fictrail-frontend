<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPen, BIconX } from 'bootstrap-vue'
import TemplateEditBasic from './template-edit-basic.vue';
import TemplateEditDeployment from './template-edit-deployment.vue';
import TemplateEditMods from './template-edit-mods.vue';
import TemplateEditSchTemplate from './template-edit-sch-template.vue';

export default {
    components:{
        BIcon, BIconPen, BIconX,
        TemplateEditBasic, TemplateEditDeployment, TemplateEditMods, TemplateEditSchTemplate,
    },
    props: {
        type: null,
        nullable: Boolean,
    },
    data() {
        return {
            isNew: false,
            isCopy: false,
            editing: {
                id: null, group_id: null, title: null, is_upbound: null,
                pivot_time: null, pivot_time_adj: null, operator_id: null, operator_id_mod: null,
                train_type_id: null, train_type_mod: null, train_name_id: null, train_name_mod: null,
                vehicle_performance_id: null, coupled_template_id: null,
                remarks: null, is_enabled: null,
                sch_template: null, mods: null, deployment: null,
            },
            editing_default: {
                is_upbound: true, pivot_time: 12 * 3600, pivot_time_adj: 0,
                train_type_mod: [], train_name_mod: [], operator_id_mod: [], is_enabled: true,
                sch_template: [], mods: [],
                deployment: [],
            },
        };
    },
    watch: {

    },
    mounted(){

    },
    methods:{
        //Show Modal
        async showNew(data){
            //Load Data
            for (var i in this.editing){
                this.editing[i] = (this.editing_default[i] !== undefined) ? this.editing_default[i] : null;
            }
            //Place Given Data
            for (var i in data){
                this.editing[i] = data[i];
            }
            //Open Modal
            this.isNew = true;
            this.isCopy = false;
            this.$refs._modal.show();
            this.$forceUpdate();
        },
        async showEdit(id, isCopy = false){
            //Load Data
            var url = `items/schdraft_template/${encodeURIComponent(id)}?`;
            var response = await $.callAPI(axios, 'GET', url);
            if (response.http_response >= 400) return false;
            for (var i in this.editing){
                this.editing[i] = response.data[i];
            }
            //Open Modal
            this.isNew = false;
            this.isCopy = isCopy;
            if (this.isCopy){
                this.editing.id = null;
            }
            this.$refs._modal.show();
            this.$forceUpdate();
        },

        //Submit
        async submit(){
            var id = this.editing.id;
            //Call API
            if (this.isNew || this.isCopy){
                //Submit New
                var response = await $.callAPI(axios, "POST", "items/schdraft_template", this.editing);
            }else{
                //Submit Edit
                var url = "items/schdraft_template/"+encodeURIComponent(id);
                var response = await $.callAPI(axios, "PATCH", url, this.editing);
            }
            if (response.http_status >= 400){
                //Failed
                this.$bvToast.toast(`保存失敗`, {
                    title: '保存失敗', variant: 'danger', toaster: 'b-toaster-bottom-right',
                });
            }else{
                //Success
                this.$emit(this.isNew ? 'created' : 'edited', id);
                this.$emit('change', id);
                this.$bvToast.toast(`已保存`, {
                    title: '已保存', variant: 'success', toaster: 'b-toaster-bottom-right',
                });
                //New / Copy Mode -> Close
                if (this.isNew || this.isCopy){
                    this.$refs._modal.hide();
                }
            }
        },

    },
    computed: {

    },
}
</script>

<template>
    <div>
        <b-modal ref="_modal" centered scrollable size="xl" no-close-on-backdrop
        header-bg-variant="dark" header-text-variant="light" hide-footer>
            <template #modal-title>
                <div class="d-flex align-items-center">
                    <div class="mr-2">{{((isNew || isCopy) ? '新增' : '編輯') + '時刻表模板'}}</div>
                    <b-button class="my-0" variant="dark" @click="$refs.json_modal.show()">
                        查看JSON
                    </b-button>
                </div>
            </template>

            <!-- 基本資料 -------------------------------------------------------------------------------------->
            <b-card title="基本資料">
                <template-edit-basic v-model="editing" :is-new="isNew" :is-copy="isCopy" />
            </b-card>

            <!-- Submit -->
            <div class="my-2 text-center">
                <b-button variant="primary" class="w-50" @click="submit">保存</b-button>
            </div>

            <!-- 時刻 -------------------------------------------------------------------------------------->
            <b-card title="時刻">
                <template-edit-sch-template v-model="editing" />
            </b-card>

            <!-- Submit -->
            <div class="my-2 text-center">
                <b-button variant="primary" class="w-50" @click="submit">保存</b-button>
            </div>

            <!-- Mod設定規則 -------------------------------------------------------------------------------------->
            <b-card title="Mod設定規則">
                <template-edit-mods v-model="editing" />
            </b-card>

            <!-- Submit -->
            <div class="my-2 text-center">
                <b-button variant="primary" class="w-50" @click="submit">保存</b-button>
            </div>

            <!-- 班次安排 -------------------------------------------------------------------------------------->
            <b-card title="班次安排">
                <template-edit-deployment v-model="editing" />
            </b-card>

            <!-- Submit -->
            <div class="my-2 text-center">
                <b-button variant="primary" class="w-50" @click="submit">保存</b-button>
            </div>

        </b-modal>

        <!-- JSON Modal -->
        <b-modal ref="json_modal" title="查看JSON" centered scrollable hide-footer size="lg"
        header-bg-variant="warning" header-text-variant="dark" >
            <vue-json-pretty :data="editing" />
        </b-modal>

    </div>
</template>