<script>
    const schdiagram_config = require('~/schdiagram-config.js');

    export default {
        props: {
            dataStations: Array,
            dataLine: Object,
            xscale: Number,
            yscale: Number,
            xpos: Number,
            ypos: Number,
            contentWidth: Number,
            contentHeight: Number,
            config: Object,
        },

        data() {
            return {
                sdc: schdiagram_config,
            };
        },

        methods: {
            handleDragStart(event){
                this.$emit('dragstart', event);
            },
            handleDragMove(event){
                this.$emit('dragmove', event);
            },
            handleDragEnd(event){
                this.$emit('dragend', event);
            },
        },

        computed: {
            basisWidth(){
                return 86400;
            },
            basisHeight(){
                return this.dataLine?.length_km || 1;
            },
            displayed_x_min(){
                return this.basisWidth * this.xpos - this.contentWidth / 2 / this.xscale;
            },
            displayed_x_max(){
                return this.basisWidth * this.xpos + this.contentWidth / 2 / this.xscale;
            },
            major_line_x_factor(){
                for (var mode of schdiagram_config.time_display_modes){
                    if (this.xscale >= mode.min_scale) return mode.major_unit;
                }
                return 3600;
            },
            major_line_x(){
                var factor = this.major_line_x_factor;
                var x_min = Math.ceil(this.displayed_x_min / factor) * factor;
                var x_max = Math.floor(this.displayed_x_max / factor) * factor;
                var arr = [];
                for (var x = x_min; x <= x_max; x+= factor){
                    arr.push(x);
                }
                return arr;
            },
            minor_line_x_factor(){
                for (var mode of schdiagram_config.time_display_modes){
                    if (this.xscale >= mode.min_scale) return mode.minor_unit;
                }
                return 300;
            },
            minor_line_x(){
                var factor = this.minor_line_x_factor;
                var x_min = Math.ceil(this.displayed_x_min / factor) * factor;
                var x_max = Math.floor(this.displayed_x_max / factor) * factor;
                var arr = [];
                for (var x = x_min; x <= x_max; x+= factor){
                    if (x % this.major_line_x_factor){
                        arr.push(x);
                    }
                }
                return arr;
            },
        },
    }

</script>

<template>
    <v-group :config="config">

        <!-- Base (Draggable) -->
        <v-rect :config="{
            x: 0, y: 0, width: basisWidth, height: basisHeight, fill: 'white',
        }" />

        <!-- Vertical Line (Major) -->
        <v-line v-for="x in major_line_x" :key="x" :config="{
            points: [x, 0, x, basisHeight],
            stroke: sdc.grid_major_color,
            strokeWidth: sdc.grid_major_width,
            strokeScaleEnabled: false,
            listening: false,
        }" />

        <!-- Vertical Line (Minor) -->
        <v-line v-for="x in minor_line_x" :key="x" :config="{
            points: [x, 0, x, basisHeight],
            stroke: sdc.grid_minor_color,
            strokeWidth: sdc.grid_minor_width,
            strokeScaleEnabled: false,
            listening: false,
        }" />

        <!-- Horizontal Line -->
        <v-line v-for="(station, i) in dataStations" :key="'st'+i" :config="{
            points: [
                0, station.mileage_km,
                basisWidth, station.mileage_km,
            ],
            stroke: sdc.grid_major_color,
            strokeWidth: sdc.grid_major_width,
            strokeScaleEnabled: false,
            listening: false,
        }" />

        <!-------------------------------------------------------------------------->
    </v-group>
</template>