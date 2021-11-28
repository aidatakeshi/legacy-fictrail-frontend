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
            screenWidth: Number,
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
            getDistanceWithNextStation(i){
                if (i < this.dataStations.length - 1){
                    var a = this.getY(this.dataStations[i]?.mileage_km || 0);
                    var b = this.getY(this.dataStations[i+1]?.mileage_km || 0);
                    return b - a;
                }
                return null;
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
            
            <!-- Station Name -->
            <v-text v-if="showLabel(station.mileage_km)" :key="'s'+i" :config="{
                x: sdc.label_station_x - sdc.label_station_width,
                y: getY(station.mileage_km) + sdc.label_station_y_shift,
                width: sdc.label_station_width,
                height: getDistanceWithNextStation(i),
                fontSize: sdc.label_station_font_size,
                fontStyle: sdc.label_station_font_style,
                align: 'right',
                text: station.name_chi,
                listening: false,
            }" />

            <!-- Mileage -->
            <v-text v-if="showLabel(station.mileage_km) && station.mileage_km" :key="'m'+i" :config="{
                x: screenWidth + sdc.label_mileage_x - sdc.label_mileage_font_size * 10,
                y: getY(station.mileage_km) + sdc.label_mileage_y_shift,
                width: sdc.label_mileage_font_size * 10,
                fontSize: sdc.label_mileage_font_size,
                fontStyle: sdc.label_mileage_font_style,
                align: 'right',
                text: `${station.mileage_km.toFixed(1)}k`,
                listening: false,
            }" />

        </template>
        
    </v-group>
</template>