<script>

const $ = require('~/common.js');

export default {
    
    props: {
        value: null,
        tabindex: null,
        decimals: Number,
        placeholder: String,
        size: String,
        disabled: Boolean,
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
            this.display = $.displaySignedNumber(this.value, this.decimals);
        },
        changeHandler(event){
            var string = event.target.value;
            var newValue = parseFloat(string);
            if (string[0] == '±') newValue = 0;
            if (isNaN(newValue)) newValue = 0;
            newValue = newValue.toFixed(this.decimals || 0) * 1;
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

    },

}

</script>

<template>
    <input class="form-control" :class="size ? ('form-control-'+size) : ''"
    :placeholder="placeholder" :tabindex="tabindex" :disabled="disabled"
    :value="display" @change="changeHandler" />
</template>