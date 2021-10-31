<script>
const $ = require('~/common.js');
export default {
    
    props: {
        value: null,
        tabindex: null,
        prevValue: null,
        nextValue: null,
        noDayChange: Boolean,
        placeholder: String,
        size: String,
        disabled: Boolean,
        bold: Boolean,
        backgroundColor: String,
        italic: Boolean,
        small: Boolean,
        center: Boolean,
        right: Boolean,
        suffix: String,
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
        },
        suffix(){
            this.handleValueUpdated();
        },
    },
    async mounted(){
        this.handleValueUpdated();
    },
    methods: {
        getTimeValue(string){
            var originalValue = this.value$;
            var prevValue = this.prevValue;
            var nextValue = this.nextValue;
            //If null, reject
            if (string === null || string === "undefined" || string === ""){
                return null;
            }
            //Check first character
            var firstChar = string.substr(0, 1);
            //If number, it is a time string
            if (firstChar >= "0" && firstChar <= "9"){
                string = string.replace(/\D/g,'');
                switch (string.length){
                    case 1: //H
                        var value = string.substr(0, 1) * 3600;
                        break;
                    case 2: //HH
                        var value = string.substr(0, 2) * 3600;
                        break;
                    case 3: //HMM
                        var value = string.substr(0, 1) * 3600 + string.substr(1, 2) * 60;
                        break;
                    case 4: //HHMM
                        var value = string.substr(0, 2) * 3600 + string.substr(2, 2) * 60;
                        break;
                    case 5: //HMMSS
                        var value = string.substr(0, 1) * 3600 + string.substr(1, 2) * 60 + string.substr(3, 2) * 1;
                        break;
                    default: //HHMMSS
                        var value = string.substr(0, 2) * 3600 + string.substr(2, 2) * 60 + string.substr(4, 2) * 1;
                }
            }
            //Otherwise...
            else{
                //If "-", subtract from next value
                //Otherwise, add from prev value
                var isMinus = (firstChar == '-');
                if (isMinus && !nextValue) return originalValue;
                if (!isMinus && !prevValue) return originalValue;
                //Check string
                string = string.replace(/\D/g,'');
                switch (string.length){
                    case 0: //Invalid
                    return originalValue;
                    case 1: //S
                        var delta = string.substr(0, 1) * 1;
                        break;
                    case 2: //SS
                        var delta = string.substr(0, 2) * 1;
                        break;
                    case 3: //MSS
                        var delta = string.substr(0, 1) * 60 + string.substr(1, 2) * 1;
                        break;
                    case 4: //MMSS
                        var delta = string.substr(0, 2) * 60 + string.substr(2, 2) * 1;
                        break;
                    case 5: //HMMSS
                        var delta = string.substr(0, 1) * 3600 + string.substr(1, 2) * 60 + string.substr(3, 2) * 1;
                        break;
                    default: //HHMMSS
                        var delta = string.substr(0, 2) * 3600 + string.substr(2, 2) * 60 + string.substr(4, 2) * 1;
                }
                //Obtain Value
                if (isMinus){
                    var value = nextValue - delta;
                }else{
                    var value = prevValue + delta;
                }
            }
            //Return Value
            if (!this.noDayChange){
                return (value - $.day_cutoff + 86400) % 86400 + $.day_cutoff;
            }else{
                return value;
            }
        },
        handleValueUpdated(){
            if (isNaN(this.value)){
                this.value$ = null;
            }else{
                this.value$ = this.value;
                this.displayString();
            }
        },
        changeHandler(event){
            var string = event.target.value;
            var newValue = this.getTimeValue(string);
            if (newValue != this.value$){
                this.$emit('input', newValue);
                this.$emit('change');
            }else{
                this.displayString();
            }
        },
        displayString(){
            var str = $.displayTime(this.value$, false, this.noDayChange);
            if (str === null){
                this.display = "";
            }else{
                this.display = str + (this.suffix || "");
            }
            this.$forceUpdate();
        },
        getStyle(){
            var obj = {};
            if (this.bold) obj['font-weight'] = 'bold';
            if (this.italic) obj['font-style'] = 'italic';
            if (this.small) obj['font-size'] = '80%';
            if (this.center) obj['text-align'] = 'center';
            if (this.right) obj['text-align'] = 'right';
            if (this.backgroundColor) obj['background-color'] = this.backgroundColor;
            return obj;
        },
    },
    computed:{
    },
}
</script>

<template>
    <input class="form-control" :class="size ? ('form-control-'+size) : ''"
    :style="getStyle()"
    :placeholder="placeholder" :tabindex="tabindex" :disabled="disabled"
    :value="display" @change="changeHandler" />
</template>

<style scoped>

</style>