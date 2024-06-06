<script>

import axios from '~/plugins/axios'
import draggable from 'vuedraggable'
const $ = require('~/common.js');
const schdraft_mod = require('~/schdraft-mods.js');

import TemplateModRuleDisplay from './template-mod-rule-display.vue';
import {
    BIcon, BIconPencilSquare, BIconPlusSquare, BIconGripVertical, BIconXSquare,
} from 'bootstrap-vue'
import SelectStationInTemplate from './select-station-in-template.vue';
import InputTime from '@/components/input-time';
import InputMinSec from '@/components/input-min-sec';
import SelectSchdraftTemplate from '@/components/select-schdraft-template';

export default {
    components:{
        BIcon, BIconPencilSquare, BIconPlusSquare, BIconGripVertical, BIconXSquare,
        draggable, TemplateModRuleDisplay,
        SelectStationInTemplate,
        InputTime, InputMinSec, SelectSchdraftTemplate,
    },
    props: {
        value: Object,
    },
    data() {
        return {
            input_rule_type: null,
            input_rule_i: null,
            input_rule_j: null,
            input_rule_params: [],
            mod_rules: schdraft_mod.rules,
        };
    },
    watch: {

    },
    mounted(){

    },
    methods:{
        getRuleOptionLabel: schdraft_mod.getRuleOptionLabel,

        changed(){
            this.$emit('input', this.value);
        },

        newRuleGroup(){
            var name = prompt('請輸入mod名稱。');
            if (!name) return false;
            this.value.mods.push({
                mod: name, rules: [],
            });
        },

        newRuleModal(i){
            this.input_rule_i = i;
            this.input_rule_j = null;
            this.input_rule_type = null;
            this.input_rule_params = [];
            this.$refs._modal.show();
        },
        
        editRuleModal(i, j){
            this.input_rule_i = i;
            this.input_rule_j = j;
            this.input_rule_type = this.value?.mods?.[i]?.rules?.[j]?.rule;
            this.input_rule_params = this.value?.mods?.[i]?.rules?.[j]?.param;
            this.$refs._modal.show();
        },

        removeRuleGroup(i){
            if (!confirm('確定移除？')) return false;
            this.value.mods.splice(i, 1);
            this.changed();
        },

        removeRule(i, j){
            if (!confirm('確定移除？')) return false;
            this.value.mods[i].rules.splice(j, 1);
            this.changed();
        },

        modalSubmit(){
            if (this.input_rule_j === null){
                this.value.mods[this.input_rule_i].rules.push({
                    rule: this.input_rule_type,
                    param: this.input_rule_params,
                });
            }else{
                this.value.mods[this.input_rule_i].rules[this.input_rule_j] = ({
                    rule: this.input_rule_type,
                    param: this.input_rule_params,
                });
            }
            this.$refs._modal.hide();
            this.changed();
        },

        getSubmitDisabled(){
            if (!this.input_rule_type) return true;
            for (var i in this.mod_rules[this.input_rule_type].param_types){
                if (this.input_rule_params[i] === null) return true;
                if (this.input_rule_params[i] === undefined) return true;
            }
        },

    },
    computed: {

    },
}
</script>

<template>
    <div>

        <draggable v-model="value.mods" @end="changed()" handle=".handle">
            <b-card v-for="(rule_group, i) in value.mods" :key="i" class="mb-2" body-class="p-1 d-flex align-items-center">
                <!-- Dragging Handle -->
                <b-button variant="link" class="handle text-secondary px-0">
                    <b-icon-grip-vertical scale="1.5" />
                </b-button>
                <!-- Main Content -->
                <div class="mr-auto flex-grow-1">
                    <!-- Mod Name -->
                    <div class="d-flex align-items-center">
                        <div class="mr-auto">
                            <b-badge>{{rule_group.mod}}</b-badge>
                            <small>(當以下所有條件成立)</small>
                        </div>
                        <b-button variant="link" class="p-0 mr-1 text-danger" @click="removeRuleGroup(i)">
                            <b-icon-x-square scale="1.2" />
                        </b-button>
                    </div>
                    <!-- Rules of the Mod -->
                    <b-list-group style="font-size: 90%;">
                        <draggable v-model="value.mods[i].rules" @end="changed()" handle=".handle2">
                            <b-list-group-item v-for="(rule, j) in rule_group.rules" :key="j"
                            class="p-1 d-flex align-items-center">
                                <b-button variant="link" class="handle2 text-secondary p-0">
                                    <b-icon-grip-vertical scale="1.2" />
                                </b-button>
                                <b-button variant="link" class="p-0 text-primary" @click="editRuleModal(i, j)">
                                    <b-icon-pencil-square scale="1" />
                                </b-button>
                                <template-mod-rule-display class="ml-1 mr-auto" :rule="rule" />
                                <b-button variant="link" class="p-0 text-danger" @click="removeRule(i, j)">
                                    <b-icon-x-square scale="1.2" />
                                </b-button>
                            </b-list-group-item>
                        </draggable>
                    </b-list-group>
                    <!-- New Rule -->
                    <b-button variant="link" class="p-0 ml-1 text-success" @click="newRuleModal(i)">
                        <b-icon-plus-square scale="1.2" />
                    </b-button>
                    <!---------------------------------------------------------------------->
                </div>
                <!---------------------------------------------------------------------->
            </b-card>
        </draggable>

        <!-- New Rule -->
        <b-card class="mb-2" body-class="p-1 d-flex align-items-center">
            <strong class="mr-2" style="white-space: nowrap;">Mod名稱</strong>
            <b-button variant="link" class="p-0 ml-2 mr-1 text-success" @click="newRuleGroup()">
                <b-icon-plus-square scale="1.2" />
            </b-button>
        </b-card>

        <!-- Edit Rule Modal -->
        <b-modal ref="_modal" hide-header hide-footer centered>
            <div class="row">
                <div class="col-sm-4">規則</div>
                <div class="col-sm-8">
                    <b-form-select v-model="input_rule_type" @input="input_rule_params=[]" size="sm">
                        <b-form-select-option :value="null">--請選擇--</b-form-select-option>
                        <b-form-select-option v-for="(rule, mod) in mod_rules" :value="mod" :key="mod">
                            {{getRuleOptionLabel(rule)}}
                        </b-form-select-option>
                    </b-form-select>
                </div>
            </div>
            <template v-if="input_rule_type">
                <div class="row" v-for="(param_type, i) in mod_rules[input_rule_type].param_types" :key="i">
                    <div class="col-sm-4">{{mod_rules[input_rule_type].param_labels[i]}}</div>
                    <div class="col-sm-8" v-if="param_type == 'time'">
                        <input-time v-model="input_rule_params[i]" size="sm" />
                    </div>
                    <div class="col-sm-8" v-if="param_type == 'minsec'">
                        <input-min-sec v-model="input_rule_params[i]" size="sm" />
                    </div>
                    <div class="col-sm-8" v-if="param_type == 'minsec-rel'">
                        <input-min-sec v-model="input_rule_params[i]" signed size="sm" />
                    </div>
                    <div class="col-sm-8" v-if="param_type == 'template'">
                        <select-schdraft-template v-model="input_rule_params[i]" size="sm" />
                    </div>
                    <div class="col-sm-8" v-if="param_type == 'station'">
                        <select-station-in-template v-model="input_rule_params[i]" size="sm"
                        :sch-template="value.sch_template" />
                    </div>
                </div>
            </template>
            <b-button variant="primary" @click="modalSubmit()" class="mt-2" :disabled="getSubmitDisabled()" block>
                提交
            </b-button>
        </b-modal>

    </div>
</template>