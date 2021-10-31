<script>
import axios from '~/plugins/axios'
const $ = require('~/common.js');
import { BootstrapVue, BIcon, BIconX, BIconPlus } from 'bootstrap-vue'
export default {
    components: { BIcon, BIconX, BIconPlus },
    
    props: {
        value: null,
    },
    data() {
        return {
            value$: [],
            new_id: null,
            new_label: null,
        };
    },
    watch: {
        value(){
            if (Array.isArray(this.value)){
                this.value$ = this.value;
            }
        }
    },
    mounted(){
        if (Array.isArray(this.value)){
            this.value$ = this.value;
        }
    },
    methods: {
        inputHandler(){
            this.$emit('focus');
            this.$emit('input', this.value$);
        },
        addItem(){
            //Check if data exists
            if (!this.new_id) return false;
            //Check if repeated
            for (var i in this.value$){
                if (this.value$[i].id == this.new_id) return false;
            }
            //Push
            this.value$.push({id: this.new_id, label: this.new_label});
            //Sort
            this.value$.sort(function(a, b){
                if (a.id < b.id) return -1;
                if (a.id > b.id) return +1;
                return 0;
            })
            //Remove field
            this.new_id = null;
            this.new_label = null;
            this.inputHandler();
        },
        removeItem(i){
            this.value$.splice(i, 1);
            this.inputHandler();
        },
    },
}
</script>

<template>
    <div>
        <table class="table table-hover my-table mb-0">
            <thead>
                <tr class="thead-light">
                    <th>ID</th>
                    <th>備註</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, i) in value$" :key="i">
                    <td class="break-word" style="max-width: 5em;">
                        <strong>{{item.id}}</strong>
                    </td>
                    <td>
                        <b-form-input v-model="value$[i].label" size="sm" @input="inputHandler" />
                    </td>
                    <td>
                        <b-button variant="danger" class="m-0" @click="removeItem(i)">
                            <b-icon-x />
                        </b-button>
                    </td>
                </tr>
                <tr>
                    <td><b-form-input v-model="new_id" size="sm" /></td>
                    <td><b-form-input v-model="new_label" size="sm" /></td>
                    <td>
                        <b-button variant="success" class="m-0" @click="addItem()">
                            <b-icon-plus />
                        </b-button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>