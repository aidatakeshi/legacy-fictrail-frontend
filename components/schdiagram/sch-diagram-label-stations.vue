<script>
    const schdiagram_config = require('~/schdiagram-config.js');

    export default {
        props: {
            dataLine: Object,
            dataStations: Array,
            yscale: Number,
            ypos: Number,
            contentHeight: Number,
            contentMidY: Number,
        },

        data() {
            return {
                sdc: schdiagram_config,
            };
        },

        methods: {
            getY(mileage_km){
                return this.contentMidY - this.ypos * this.basisHeight * this.yscale
                + mileage_km * this.yscale;
            },
            showLabel(mileage_km){
                var y = this.getY(mileage_km);
                var y_min = this.contentMidY - this.contentHeight / 2 - this.sdc.label_station_y_hide_tolerance;
                var y_max = this.contentMidY + this.contentHeight / 2 + this.sdc.label_station_y_hide_tolerance;
                if (y >= y_min && y <= y_max) return true;
            },
        },

        computed: {
            basisHeight(){
                return this.dataLine?.length_km || 1;
            },
        },
    }

</script>

<template>
    <v-group :config="{x: 0, y: 0}">

        <template v-for="(station, i) in dataStations">
            <v-text v-if="showLabel(station.mileage_km)" :key="'st'+i" :config="{
                x: sdc.label_station_x - sdc.label_station_width,
                y: getY(station.mileage_km) + sdc.label_station_y_shift - sdc.label_station_font_size * 5,
                width: sdc.label_station_width,
                height: sdc.label_station_font_size * 10,
                fontSize: sdc.label_station_font_size,
                fontStyle: sdc.label_station_font_style,
                align: 'right',
                verticalAlign: 'middle',
                text: station.name_chi,
                listening: false,
            }" />
        </template>
        
    </v-group>
</template>