<script>

const $ = require('~/common.js');

export default {
    
    props: {
        value: null,
        tabindex: null,
        placeholder: String,
        originalClass: Boolean,
    },

    data() {
        return {
            value$: 0,
            display: "",
        };
    },

    watch: {
        value(){
            this.value$ = this.value;
            this.handleValueUpdated();
        }
    },

    async mounted(){
        this.value$ = this.value;
        this.handleValueUpdated();
    },

    methods: {
        handleValueUpdated(){
            this.display = $.displaySignedInteger(this.value);
        },
        changeHandler(event){
            var string = event.target.value;
            var newValue = parseInt(string);
            if (string[0] == '±') newValue = 0;
            if (isNaN(newValue)) newValue = 0;
            if (newValue != this.value$){
                this.$emit('input', newValue);
                this.value$ = newValue;
            }else{
                this.handleValueUpdated();
            }
            this.$forceUpdate();
        },
    },

    computed:{
        myClass(){
            return {
                'schdraft-time-input': !this.originalClass,
                'form-control': this.originalClass,
                'w-100': this.originalClass,
            };
        }
    },

}

</script>

<template>
    <input :placeholder="placeholder" :class="myClass" :tabindex="tabindex"
    :value="display" @change="changeHandler" />
</template>