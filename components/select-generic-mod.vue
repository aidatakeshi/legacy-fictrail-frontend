<script>
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
        variant: null,
    },

    data() {
        return {
            value$: null,
            new_mod_value: null,
        };
    },

    watch: {
        value(){
            this.value$ = this.value;
        },
    },

    async mounted(){
        this.value$ = this.value;
    },

    methods: {
        removeMod(id){
            delete this.value$[id];
            this.$emit('input', this.value$);
            this.$emit('change');
            this.$forceUpdate();
        },
        newMod(){
            var id = prompt('請輸入mod ID');
            if (!id) return null;
            this.value$[id] = this.new_mod_value;
            this.new_mod_value = null;
            this.$emit('input', this.value$);
            this.$emit('change');
            this.$forceUpdate();
        },
    },

}

</script>

<template>
    <b-button :variant="variant" @click="$refs._modal.show()">
        <slot></slot>

        <b-modal ref="_modal" hide-header hide-footer centered>
            <div class="text-right">
                <b-button variant="link" class="p-2 mt-n3 mr-n3 text-secondary"
                @click="$refs._modal.hide()">
                    <b-icon-x scale="1.2" />
                </b-button>
            </div>
            <div class="d-flex align-items-center" v-for="(item, id) in value$" :key="id">
                <div>{{id}}</div>
                <div class="mr-auto">
                    <b-button variant="link" class="p-0" @click="removeMod(id)">
                        <b-icon-x variant="danger" tabindex="10" />
                    </b-button>
                </div>
                <div class="w-50">
                    <select-generic v-model="value$[id]" @input="$forceUpdate()"
                    :type="type" :sort="sort" :subType="subType" :subSort="subSort"
                    :foreignId="foreignId" :operatorAttr="operatorAttr" />
                </div>
            </div>
            <div class="d-flex align-items-center" style="background-color: #f8f8f8;">
                <div class="w-50">
                    <b-button variant="outline-success" @click="newMod()">
                        <b-icon-plus /> 新增
                    </b-button>
                </div>
                <div class="w-50">
                    <select-generic v-model="new_mod_value" @input="$forceUpdate()"
                    :type="type" :sort="sort" :subType="subType" :subSort="subSort"
                    :foreignId="foreignId" :operatorAttr="operatorAttr" />
                </div>
            </div>
        </b-modal>

    </b-button>
</template>