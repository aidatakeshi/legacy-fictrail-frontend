<script>

export default {

    props: {
        screenWidth: Number,
        screenHeight: Number,
        config: null,
        zoom: Number,
        selected: Boolean,
        editable: Boolean,
        showScale: Boolean,
        showCompass: Boolean,
    },

    data() {
        return {
        };
    },

    methods: {
    },

    computed: {
        pixelsPerKm(){
            return this.config.map_height / this.config.lat_span / (this.config.earth_radius * Math.PI / 180);
        },
        specs(){
            var scale_km = this.config.scale_width_max / (this.pixelsPerKm * this.zoom);
            for (var i in this.config.scale_levels){
                if (this.config.scale_levels[i].dist <= scale_km){
                    scale_km = this.config.scale_levels[i].dist;
                    var scale_text = this.config.scale_levels[i].text;
                    var scale_text_half = this.config.scale_levels[i].text_half;
                    break;
                }
            }
            var rulerWidth = scale_km * this.pixelsPerKm * this.zoom;
            return { scale_text, scale_text_half, rulerWidth };
        },
    },
}

</script>

<template>
    <v-group>

        <!-- Scale -->
        <v-group v-if="showScale" :config="{ x: screenWidth - config.scale_right, y: + config.scale_top }">
            <v-line :config="{
                points: [
                    0, config.scale_height,
                    0, 0,
                    -specs.rulerWidth, 0,
                    -specs.rulerWidth, config.scale_height,
                ],
                stroke: 'black',
                strokeWidth: config.scale_border,
                strokeScaleEnabled: false,
                listening: false,
            }" />
            <v-text :config="{
                x: - specs.rulerWidth - config.scale_text_width + config.scale_text_x_shift,
                y: config.scale_text_y_shift,
                text: specs.scale_text,
                fontSize: config.scale_font_size,
                width: config.scale_text_width,
                align: 'right',
                fontStyle: 'bold',
                listening: false,
            }" />
        </v-group>

        <!-- Compass -->
        <v-group v-if="showCompass" :config="{ x: screenWidth / 2, y: screenHeight / 2 }">
            <v-circle v-for="i in 10" :key="i" :config="{
                radius: specs.rulerWidth * i / 10,
                stroke: 'black',
                strokeWidth: (i % 5) ? config.compass_minor_border : config.compass_major_border,
                opacity: (i % 5) ? config.compass_minor_alpha : config.compass_major_alpha,
                strokeScaleEnabled: false,
                listening: false,
            }" />
            <v-line :config="{
                stroke: 'black',
                points: [-specs.rulerWidth, 0, +specs.rulerWidth, 0],
                strokeWidth: config.compass_major_border,
                opacity: config.compass_major_alpha,
                strokeScaleEnabled: false,
                listening: false,
            }" />
            <v-text :config="{
                x: specs.rulerWidth + config.compass_text_x_shift,
                y: config.compass_text_y_shift1,
                text: `外: R = ${specs.scale_text}`,
                fontSize: config.compass_font_size,
                width: config.compass_text_width,
                align: 'left',
                fontStyle: 'bold',
                listening: false,
            }" />
            <v-text :config="{
                x: specs.rulerWidth + config.compass_text_x_shift,
                y: config.compass_text_y_shift2,
                text: `內: R = ${specs.scale_text_half}`,
                fontSize: config.compass_font_size,
                width: config.compass_text_width,
                align: 'left',
                fontStyle: 'bold',
                listening: false,
            }" />
        </v-group>

    </v-group>
</template>