<script>
export default {
    
    props: {
        value: null,
        tabindex: null,
        placeholder: String,
        size: String,
        disabled: Boolean,
        signed: Boolean,
    },
    data() {
        return {
            value$: null,
            display: "",
        };
    },
    watch: {
        value(val){
            this.handleValueUpdated(val);
        }
    },
    async mounted(){
        this.handleValueUpdated(this.value);
    },
    methods: {
        zero(value){
            return (value < 10 ? '0' : '') + value;
        },
        handleValueUpdated(value){
            if (isNaN(value)) return null;
            var lessThen0 = false;
            if (value < 0){
                lessThen0 = true;
                value = -value;
            }
            var h = Math.round(Math.floor(value / 3600));
            var m = Math.round(Math.floor(value / 60) % 60);
            var s = Math.round(value % 60);
            var mark = '';
            if (lessThen0){
                mark = '-';
            }else if (this.signed){
                mark = (value) ? '+' : '±';
            }
            if (value < 60){
                this.display = `${mark}${s}s`;
            }else if (value < 3600){
                this.display = `${mark}${m}m${this.zero(s)}s`;
            }else{
                this.display = `${mark}${h}h${this.zero(m)}m${this.zero(s)}s`;
            }
            this.$forceUpdate();
        },
        getTimeValue(string, originalValue){
            //If null, reject
            if (string === null || string === "undefined" || string === ""){
                return originalValue;
            }
            //Check first character
            var firstChar = string.substr(0, 1);
            var signum = 1;
            if (firstChar == '-') signum = -1;
            //If number, it is a time string
            string = string.replace(/\D/g,'');
            switch (string.length){
                case 0:
                    return originalValue;
                case 1: //S
                    return signum * (string.substr(0, 1) * 1);
                case 2: //SS
                    return signum * (string.substr(0, 2) * 1);
                case 3: //MSS
                    return signum * (string.substr(0, 1) * 60 + string.substr(1, 2) * 1);
                case 4: //MMSS
                    return signum * (string.substr(0, 2) * 60 + string.substr(2, 2) * 1);
                case 5: //HMMSS
                    return signum * (string.substr(0, 1) * 3600 + string.substr(1, 2) * 60 + string.substr(3, 2) * 1);
                default: //HHMMSS
                    return signum * (string.substr(0, 2) * 3600 + string.substr(2, 2) * 60 + string.substr(4, 2) * 1);
            }
        },
        changeHandler(event){
            var string = event.target.value;
            var newValue = this.getTimeValue(string, this.value$);
            if (newValue != this.value$){
                this.$emit('input', newValue);
            }else{
                this.handleValueUpdated(this.value$);
            }
        },
    },
}
</script>

<template>
    <input class="form-control" :class="size ? ('form-control-'+size) : ''"
    :placeholder="placeholder" :tabindex="tabindex" :disabled="disabled"
    :value="display" @change="changeHandler" />
</template>