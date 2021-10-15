<script>

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const sd = require('~/schdraft.js');

export default {
    
    props: {
        value: null,
        prevValue: null,
        nextValue: null,
        tabindex: null,
        depart: Boolean,
        pass: Boolean,
        placeholder: String,
        originalClass: Boolean,
        small: Boolean,
    },

    data() {
        return {
            value$: null,
            display: "",
        };
    },

    watch: {
        value(){
            this.handleValueUpdated();
        }
    },

    async mounted(){
        this.handleValueUpdated();
    },

    methods: {
        handleValueUpdated(){
            if (isNaN(this.value)){
                if (!this.pass) return false;
                this.value$ = null;
            }else{
                this.value$ = this.value;
                this.display = sd.displayTime(this.value, this.pass);
            }
        },
        changeHandler(event){
            var string = event.target.value;
            var newValue = sd.getTimeValue(string, this.value$, this.prevValue, this.nextValue, this.pass);
            if (newValue != this.value$){
                this.$emit('input', newValue);
                this.$emit('change');
            }else{
                this.display = sd.displayTime(this.value$, this.pass);
                this.$forceUpdate();
            }
        },
    },

    computed:{
        myClass(){
            return {
                'depart': this.depart,
                'pass': this.pass,
                'schdraft-time-input': !this.originalClass,
                'form-control': this.originalClass,
                'form-control-sm': this.originalClass && this.small,
                'w-100': this.originalClass,
            };
        }
    },

}

</script>

<template>
    <input :placeholder="placeholder" :class="myClass" :tabindex="tabindex"
    :value="((pass && value) ? `${display}通` : display)"
    @change="changeHandler" />
</template>