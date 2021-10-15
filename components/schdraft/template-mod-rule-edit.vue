<script>

import axios from '~/plugins/axios'
import draggable from 'vuedraggable'
const $ = require('~/common.js');
const sd = require('~/schdraft.js');
const smod = require('~/schdraft-mods.js');

import TemplateModRuleDisplay from './template-mod-rule-display.vue';
import InputTime from './input-time.vue';
import InputMinSec from './input-min-sec.vue';
import InputScheduleStation from './input-schedule-station.vue';
import { BIcon, BIconPencil, BIconPlus, BIconGripVertical, BIconX } from 'bootstrap-vue'

export default {

    components: {
        draggable, TemplateModRuleDisplay,
        BIcon, BIconPencil, BIconPlus, BIconGripVertical, BIconX,
        InputTime, InputMinSec, InputScheduleStation,
    },
    
    props: {
        value: null,
        schedule: Array,
    },

    data() {
        return {
            value$: null,
            input_mod_name: null,
            input_rule_type: null,
            input_rule_i: null,
            input_rule_j: null,
            input_rule_params: [],
            //
            mod_rules: smod.rules,
        };
    },

    watch: {
        value(){
            this.loadData();
        }
    },

    async mounted(){
        this.loadData();
    },

    methods: {
        getRuleOptionLabel: smod.getRuleOptionLabel,
        //
        loadData(){
            this.value$ = this.value;
            if (!Array.isArray(this.value$)) this.value$ = [];
        },
        update(){
            this.$emit('input', this.value$);
            this.$forceUpdate();
        },
        newRuleGroup(){
            this.value$.push({
                mod: this.input_mod_name, rules: [],
            });
            this.input_mod_name = null;
        },
        removeRuleGroup(i){
            if (!confirm('確定移除？')) return false;
            this.value$.splice(i, 1);
            this.update();
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
            this.input_rule_type = this.value$[i].rules[j].rule;
            this.input_rule_params = this.value$[i].rules[j].param;
            this.$refs._modal.show();
        },
        removeRule(i, j){
            if (!confirm('確定移除？')) return false;
            this.value$[i].rules.splice(j, 1);
            this.update();
        },
        modalSubmit(){
            if (this.input_rule_j === null){
                this.value$[this.input_rule_i].rules.push({
                    rule: this.input_rule_type,
                    param: this.input_rule_params,
                });
            }else{
                this.value$[this.input_rule_i].rules[this.input_rule_j] = ({
                    rule: this.input_rule_type,
                    param: this.input_rule_params,
                });
            }
            this.$refs._modal.hide();
            this.update();
        },
        getSubmitDisabled(){
            if (!this.input_rule_type) return true;
            for (var i in this.mod_rules[this.input_rule_type].param_types){
                if (this.input_rule_params[i] === null) return true;
                if (this.input_rule_params[i] === undefined) return true;
            }
        },
    },

}

</script>

<template>
    <div>

        <draggable v-model="value$" @end="update()" handle=".handle">
            <b-card v-for="(rule_group, i) in value$" :key="i" class="mb-2" body-class="p-1 d-flex align-items-center">
                <div class="mr-auto flex-grow-1">
                    <div class="d-flex align-items-center">
                        <div class="mr-auto">
                            <strong>"{{rule_group.mod}}"</strong>
                            <small>(當以下所有條件成立)</small>
                        </div>
                        <b-button variant="link" class="p-0 mr-1 text-danger" @click="removeRuleGroup(i)">
                            <b-icon-x scale="1.2" />
                        </b-button>
                    </div>
                    <b-list-group style="font-size: 90%;">
                        <draggable v-model="value$[i].rules" @end="update()" handle=".handle2">
                            <b-list-group-item v-for="(rule, j) in rule_group.rules" :key="j"
                            class="p-1 d-flex align-items-center">
                                <b-button variant="link" class="p-0 text-danger" @click="removeRule(i, j)">
                                    <b-icon-x scale="1.2" />
                                </b-button>
                                <template-mod-rule-display class="mr-auto" :rule="rule" />
                                <b-button variant="link" class="p-0 text-info" @click="editRuleModal(i, j)">
                                    <b-icon-pencil scale="1" />
                                </b-button>
                                <b-button variant="link" class="handle2 text-secondary p-0">
                                    <b-icon-grip-vertical scale="1.2" />
                                </b-button>
                            </b-list-group-item>
                        </draggable>
                    </b-list-group>
                    <b-button variant="link" class="p-0 ml-1 text-success" @click="newRuleModal(i)">
                        <b-icon-plus scale="1.2" />
                    </b-button>
                </div>
                <b-button variant="link" class="handle text-secondary px-0">
                    <b-icon-grip-vertical scale="1.5" />
                </b-button>
            </b-card>
        </draggable>

        <!-- New Rule -->
        <b-card class="mb-2" body-class="p-1 d-flex align-items-center">
            <strong class="mr-2" style="white-space: nowrap;">Mod名稱</strong>
            <b-form-input size="sm" v-model="input_mod_name" />
            <b-button variant="link" class="p-0 ml-2 mr-1 text-success" @click="newRuleGroup()" :disabled="!input_mod_name">
                <b-icon-plus scale="1.2" />
            </b-button>
        </b-card>

        <!-- Open Modal -->
        <b-modal ref="_modal" hide-header hide-footer centered>
            <div class="row">
                <div class="col-sm-4">規則</div>
                <div class="col-sm-8">
                    <b-form-select v-model="input_rule_type" @input="input_rule_params=[]">
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
                        <input-time v-model="input_rule_params[i]" original-class />
                    </div>
                    <div class="col-sm-8" v-if="param_type == 'minsec'">
                        <input-min-sec v-model="input_rule_params[i]" original-class />
                    </div>
                    <div class="col-sm-8" v-if="param_type == 'minsec-rel'">
                        <input-min-sec v-model="input_rule_params[i]" allow-negative original-class />
                    </div>
                    <div class="col-sm-8" v-if="param_type == 'template'">
                        <select-schdraft-template v-model="input_rule_params[i]" />
                    </div>
                    <div class="col-sm-8" v-if="param_type == 'station'">
                        <input-schedule-station v-model="input_rule_params[i]" :schedule="schedule" />
                    </div>
                </div>
            </template>
            <b-button variant="primary" @click="modalSubmit()" class="mt-2" :disabled="getSubmitDisabled()" block>
                提交
            </b-button>
        </b-modal>

    </div>
</template>