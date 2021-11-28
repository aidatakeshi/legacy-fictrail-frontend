<script>
    const schdiagram_config = require('~/schdiagram-config.js');

    export default {
        props: {
            xscale: Number,
            xpos: Number,
            contentWidth: Number,
            contentMidX: Number,
        },

        data() {
            return {
                sdc: schdiagram_config,
            };
        },

        methods: {
            getX(value_0_86400){
                return this.contentMidX - this.xpos * this.basisWidth * this.xscale + value_0_86400 * this.xscale;
            },
            getXByTime(time){
                return this.getX(time -  this.sdc.hour_start * 3600);
            },
            getTimeByX(x){
                var value_0_86400 = (x - this.contentMidX + this.xpos * this.basisWidth * this.xscale) / this.xscale;
                return value_0_86400 + this.sdc.hour_start * 3600;
            },
            zero(x){
                return (x < 10 ? '0' : '') + x;
            }
        },

        computed: {
            basisWidth(){
                return 86400;
            },
            label_x_factor(){
                for (var mode of schdiagram_config.time_display_modes){
                    if (this.xscale >= mode.min_scale) return mode.label_unit;
                }
                return 3600;
            },
            label_format(){
                for (var mode of schdiagram_config.time_display_modes){
                    if (this.xscale >= mode.min_scale) return mode.label;
                }
                return "H:MM";
            },
            labels(){
                var x_min = this.contentMidX - this.contentWidth / 2 - this.sdc.label_time_x_hide_tolerance;
                var x_max = this.contentMidX + this.contentWidth / 2 + this.sdc.label_time_x_hide_tolerance;
                var factor = this.label_x_factor;
                var format = this.label_format;
                var time_min = Math.ceil(this.getTimeByX(x_min) / factor) * factor;
                var time_max = Math.floor(this.getTimeByX(x_max) / factor) * factor;
                var arr = [];
                for (var time = time_min; time <= time_max; time += factor){
                    var x = this.getXByTime(time);
                    var hour = Math.floor(time / 3600) % 24;
                    var min = Math.floor(time / 60) % 60;
                    if (format == 'H'){
                        arr.push({x: x, time: time, big: true, label: `${hour}`});
                    }else if (format == "H:MM"){
                        arr.push({x: x, time: time, big: false, label: `${hour}:${this.zero(min)}`});
                    }else{
                        if (min){
                            arr.push({x: x, time: time, big: false, label: `:${this.zero(min)}`});
                        }else{
                            arr.push({x: x, time: time, big: true, label: `${hour}`});
                        }
                    }
                }
                return arr;
            },
        },
    }

</script>

<template>
    <v-group :config="{x: 0, y: 0}">

        <v-text v-for="(label, i) in labels" :key="i" :config="{
            x: label.x - sdc.label_time_big_font_size * 5,
            y: sdc.margin_top + (label.big ? sdc.label_time_big_y_shift : sdc.label_time_y_shift),
            width: sdc.label_time_big_font_size * 10,
            fontSize: label.big ? sdc.label_time_big_font_size : sdc.label_time_font_size,
            fontStyle: label.big ? sdc.label_time_big_font_style : sdc.label_time_font_style,
            align: 'center',
            text: label.label,
            listening: false,
        }" />
        
    </v-group>
</template>