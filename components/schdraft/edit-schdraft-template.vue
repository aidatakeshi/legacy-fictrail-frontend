<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');

import { BIcon, BIconPen, BIconX, BIconCode, BIconTable } from 'bootstrap-vue'
import TemplateEditBasic from './template-edit-basic.vue';
import TemplateEditDeployment from './template-edit-deployment.vue';
import TemplateEditMods from './template-edit-mods.vue';
import TemplateEditSchTemplate from './template-edit-sch-template.vue';
import TemplateEditStationMod from './template-edit-station-mod.vue';
import ViewTemplateOutput from './view-template-output.vue';

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconCode, BIconTable,
        TemplateEditBasic, TemplateEditDeployment, TemplateEditMods,
        TemplateEditSchTemplate, TemplateEditStationMod,
        ViewTemplateOutput,
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
                station_begin_mod: null, station_terminate_mod: null,
                remarks: null, is_enabled: null,
                sch_template: null, mods: null, deployment: null,
            },
            editing_default: {
                is_upbound: true, pivot_time: 12 * 3600, pivot_time_adj: 0,
                train_type_mod: [], train_name_mod: [], operator_id_mod: [], is_enabled: true,
                station_begin_mod: [], station_terminate_mod: [],
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
                    title: '保存失敗', variant: 'danger', toaster: 'b-toaster-top-left',
                });
            }else{
                //Success
                this.$emit(this.isNew ? 'created' : 'edited', id);
                this.$emit('change', id);
                this.$bvToast.toast(`已保存`, {
                    title: '已保存', variant: 'success', toaster: 'b-toaster-top-left',
                });
                //New / Copy Mode -> Close
                if (this.isNew || this.isCopy){
                    this.$refs._modal.hide();
                }
            }
        },

    },
    computed: {
        modalTitle(){
            var str = ((this.isNew || this.isCopy) ? '新增' : '編輯') + `時刻表模板`;
            str += (this.editing.title) ? ` (${this.editing.title})` : '';
            return str;
        },
    },
}
</script>

<template>
    <div>
        <b-modal ref="_modal" centered scrollable size="xl" no-close-on-backdrop
        header-bg-variant="dark" header-text-variant="light" footer-class="py-1"
        :title="modalTitle">
            <template #modal-footer>
                <b-button class="my-0 ml-1" variant="outline-dark" @click="$refs.output_modal.show()">
                    <b-icon-table scale="1.2" />
                </b-button>
                <b-button class="my-0 ml-1" variant="outline-secondary" @click="$refs.json_modal.show()">
                    <b-icon-code scale="1.2" />
                </b-button>
                <b-button class="my-0 ml-1" variant="primary" @click="submit()">
                    保存
                </b-button>
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

            <!-- 班次安排 -------------------------------------------------------------------------------------->
            <b-card title="班次安排">
                <template-edit-deployment v-model="editing" />
            </b-card>

            <!-- Submit -->
            <div class="my-2 text-center">
                <b-button variant="primary" class="w-50" @click="submit">保存</b-button>
            </div>

            <!-- Mod縮短起點/終點安排 ------------------------------------------------------------------------------>
            <b-card title="Mod更改起點/終點站安排">
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

        </b-modal>

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

<style scoped>

</style>