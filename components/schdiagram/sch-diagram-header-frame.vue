<script>
    const config = require('~/schdiagram-config.js');

    export default {
        props: {
            screenWidth: Number,
            screenHeight: Number,
        },

        data() {
            return {
                config: config,
            };
        },

        methods: {
        },

        computed: {
        },
    }

</script>

<template>
    <v-group>
        <v-rect :config="{
            x: 0, y: 0, width: screenWidth, height: config.margin_top,
            fill: config.frame_bg_color,
        }"/>
        <v-rect :config="{
            x: 0, y: 0, width: config.margin_left, height: screenHeight,
            fill: config.frame_bg_color,
        }"/>
        <v-rect :config="{
            x: 0, y: screenHeight - config.margin_bottom, width: screenWidth, height: config.margin_bottom,
            fill: config.frame_bg_color,
        }"/>
        <v-rect :config="{
            x: screenWidth - config.margin_right, y: 0, width: config.margin_right, height: screenHeight,
            fill: config.frame_bg_color,
        }"/>
        <v-rect :config="{
            x: config.margin_left, y: config.margin_top,
            width: screenWidth - config.margin_left - config.margin_right,
            height: screenHeight - config.margin_top - config.margin_bottom,
            stroke: config.grid_frame_color,
            strokeWidth: config.grid_frame_width,
            strokeScaleEnabled: false,
            listening: false,
        }"/>
    </v-group>
</template>