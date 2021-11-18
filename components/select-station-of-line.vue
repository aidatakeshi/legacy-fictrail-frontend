<script>
import axios from '~/plugins/axios'
const $ = require('~/common.js');

export default {
    props: {
        value: null,
        lineId: null,
        nullable: Boolean,
        size: String,
    },
    data() {
        return {
            options: [],
            selected: null,
        };
    },
    watch: {
        value(){
            this.selected = this.value ? this.value : null;
        },
        lineId(){
            this.updateOptions();
            this.selected = null;
            this.$emit('input', this.selected);
        },
    },
    mounted(){
        this.updateOptions();
    },
    methods:{
        async updateOptions(){
            //Null Option
            if (this.nullable){
                var options = [{ value: null, text: '-- 不設定 --' }];
            }else{
                var options = [{ value: null, text: '-- 請選擇 --', disabled: true }];
            }

            //Call API
            var response = await $.callAPI(axios, 'GET', 'line/'+this.lineId+'/stations?from_selecter=1');
            if (response.http_status >= 400) return false;
            var result = response.data;
            for (var i in result){
                if (!result[i].name_chi) continue;
                options.push({
                    value: result[i].station_id,
                    text: `${result[i].name_chi} [${result[i].name_eng}]`,
                });
            }
            //Output Options
            this.options = options;
            //Selected
            this.selected = this.value ? this.value : null;
        },
    },
}
</script>

<template>
    <div>
        <b-form-select v-model="selected" :options="options" :size="size"
            @input="$emit('input', selected); $emit('focus');"
            @change="$emit('change', selected)"
            @focus="$emit('focus')"
        ></b-form-select>
    </div>
</template>