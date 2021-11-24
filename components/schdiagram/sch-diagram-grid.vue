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
            integersArray(a, b, step){
                var arr = [];
                for (var i = a; i <= b; i+= step) arr.push(i);
                return arr;
            },
            getLineWidth(major_scale_limit){
                if (this.xscale >= major_scale_limit) return schdiagram_config.grid_major_width;
                return schdiagram_config.grid_minor_width;
            },
            getLineColor(major_scale_limit){
                if (this.xscale >= major_scale_limit) return schdiagram_config.grid_major_color;
                return schdiagram_config.grid_minor_color;
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
            array_0_24_1(){ return this.integersArray(0, 24, 1) },
            array_0_23_1(){ return this.integersArray(0, 23, 1) },
            array_0_60_1(){ return this.integersArray(0, 60, 1) },
            array_0_59_1(){ return this.integersArray(0, 59, 1) },
            array_0_60_5(){ return this.integersArray(0, 60, 5) },
            array_0_55_5(){ return this.integersArray(0, 55, 5) },
            array_0_5_1(){ return this.integersArray(0, 5, 1) },
            array_0_4_1(){ return this.integersArray(0, 4, 1) },
        },
    }

</script>

<template>
    <v-group :config="config"
    @dragstart="handleDragStart" @dragmove="handleDragMove" @dragend="handleDragEnd">

        <!-- Base (Draggable) -->
        <v-rect :config="{
            x: 0, y: 0, width: basisWidth, height: basisHeight, fill: 'white',
        }" />

        <!-- Vertical Line (5 Sec) -->
        <template v-if="xscale >= sdc.time_5s_show_scale">
            <v-group v-for="h in array_0_23_1" :key="'vs'+h" :config="{x: 3600 * h, y: 0}">
                <template v-if="3600 * h >= displayed_x_min - 3600 && 3600 * h <= displayed_x_max">
                    <v-group v-for="m in array_0_59_1" :key="m" :config="{x: 60 * m, y: 0}">
                        <v-line v-for="s in array_0_55_5" :key="s" :config="{
                            points: [
                                s, 0,
                                s, basisHeight,
                            ],
                            stroke: getLineColor(sdc.time_5s_major_scale),
                            strokeWidth: getLineWidth(sdc.time_5smajor_scale),
                            strokeScaleEnabled: false,
                            listening: false,
                        }" />
                    </v-group>
                </template>
            </v-group>
        </template>

        <!-- Vertical Line (1 Min) -->
        <template v-if="xscale >= sdc.time_1m_show_scale">
            <v-group v-for="h in array_0_23_1" :key="'vm'+h" :config="{x: 3600 * h, y: 0}">
                <template v-if="3600 * h >= displayed_x_min - 3600 && 3600 * h <= displayed_x_max">
                    <v-group v-for="f in array_0_55_5" :key="f" :config="{x: 60 * f, y: 0}">
                        <v-line v-for="m in array_0_4_1" :key="m" :config="{
                            points: [
                                60 * m, 0,
                                60 * m, basisHeight,
                            ],
                            stroke: getLineColor(sdc.time_1m_major_scale),
                            strokeWidth: getLineWidth(sdc.time_1m_major_scale),
                            strokeScaleEnabled: false,
                            listening: false,
                        }" />
                    </v-group>
                </template>
            </v-group>
        </template>

        <!-- Vertical Line (5 Mins) -->
        <template v-if="xscale >= sdc.time_5m_show_scale">
            <v-group v-for="h in array_0_23_1" :key="'vf'+h" :config="{x: 3600 * h, y: 0}">
                <v-line v-for="m in array_0_55_5" :key="m" :config="{
                    points: [
                        60 * m, 0,
                        60 * m, basisHeight,
                    ],
                    stroke: getLineColor(sdc.time_5m_major_scale),
                    strokeWidth: getLineWidth(sdc.time_5m_major_scale),
                    strokeScaleEnabled: false,
                    listening: false,
                }" />
            </v-group>
        </template>

        <!-- Vertical Line (1 Hour) -->
        <v-line v-for="h in array_0_24_1" :key="'vh'+h" :config="{
            points: [
                3600 * h, 0,
                3600 * h, basisHeight,
            ],
            stroke: sdc.grid_major_color,
            strokeWidth: sdc.grid_major_width,
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