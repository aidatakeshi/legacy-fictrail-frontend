<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPen, BIconX, BIconCode, BIconTable, BIconFileEarmark } from 'bootstrap-vue'
import TemplateEditBasic from './template-edit-basic.vue';
import TemplateEditDeployment from './template-edit-deployment.vue';
import TemplateEditMods from './template-edit-mods.vue';
import TemplateEditSchTemplate from './template-edit-sch-template.vue';
import TemplateEditStationMod from './template-edit-station-mod.vue';
import ViewTemplateOutput from './view-template-output.vue';

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconCode, BIconTable, BIconFileEarmark,
        TemplateEditBasic, TemplateEditDeployment, TemplateEditMods,
        TemplateEditSchTemplate, TemplateEditStationMod,
        ViewTemplateOutput,
    },
    props: {
        id: null,
    },
    data() {
        return {
            editing: {},
        };
    },
    watch: {

    },
    async mounted(){
        //Load Data
        var url = `items/schdraft_template/${encodeURIComponent(this.id)}?`;
        var response = await $.callAPI(axios, 'GET', url);
        if (response.http_status >= 400) return false;
        this.editing = response.data;
        this.$forceUpdate();
    },
    methods:{

        //Submit
        async submit(){
            var id = this.id;
            //Submit Edit
            var url = "items/schdraft_template/"+encodeURIComponent(id);
            var response = await $.callAPI(axios, "PATCH", url, this.editing);
            if (response.http_status >= 400){
                //Failed
                this.$bvToast.toast(`保存失敗`, {
                    title: '保存失敗', variant: 'danger', toaster: 'b-toaster-bottom-right',
                });
            }else{
                //Success
                this.$bvToast.toast(`已保存`, {
                    title: '已保存', variant: 'success', toaster: 'b-toaster-bottom-right',
                });
            }
        },

    },
}
</script>

<template>
    <div>
        <div class="py-1"
        style="position: sticky; top: 0; z-index: 2; background-color: white;">
            <b-button size="sm" variant="primary" @click="submit">
                <b-icon-file-earmark /> 保存
            </b-button>
            <b-button size="sm" variant="outline-dark" @click="$refs.output_modal.show()">
                <b-icon-table /> 輸出班次
            </b-button>
            <b-button size="sm" variant="outline-secondary" @click="$refs.json_modal.show()">
                <b-icon-code /> JSON
            </b-button>
        </div>

        <!-- 基本資料 -------------------------------------------------------------------------------------->
        <b-card title="基本資料" class="mt-2">
            <template-edit-basic v-model="editing" />
        </b-card>

        <!-- 時刻 -------------------------------------------------------------------------------------->
        <b-card title="時刻" class="mt-2">
            <template-edit-sch-template v-model="editing"
            :vehicle-performance-id="editing.vehicle_performance_id" />
        </b-card>

        <!-- 班次安排 -------------------------------------------------------------------------------------->
        <b-card title="班次安排" class="mt-2">
            <template-edit-deployment v-model="editing" />
        </b-card>

        <!-- Mod縮短起點/終點安排 ------------------------------------------------------------------------------>
        <b-card title="Mod更改起點/終點站安排" class="mt-2">
            <div class="row">
                <div class="col-md-6">
                    <template-edit-station-mod v-model="editing.station_begin_mod"
                    :sch-template="editing.sch_template" is-begin />
                </div>
                <div class="col-md-6">
                    <template-edit-station-mod v-model="editing.station_terminate_mod"
                    :sch-template="editing.sch_template" is-terminate />
                </div>
            </div>
        </b-card>

        <!-- Mod設定規則 -------------------------------------------------------------------------------------->
        <b-card title="Mod設定規則" class="mt-2">
            <template-edit-mods v-model="editing" />
        </b-card>

        <!------------------------------------------------------------------------------------------------>

        <!-- JSON Modal -->
        <b-modal ref="json_modal" title="查看JSON" centered scrollable hide-footer size="lg"
        header-bg-variant="warning" header-text-variant="dark" >
            <vue-json-pretty :data="editing" />
        </b-modal>

        <!-- Output Modal -->
        <b-modal ref="output_modal" title="輸出班次" centered scrollable hide-footer size="lg"
        header-bg-variant="warning" header-text-variant="dark" >
            <view-template-output :template-id="editing.id" />
        </b-modal>

    </div>
</template>