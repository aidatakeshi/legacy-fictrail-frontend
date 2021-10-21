<script>

export default {

    props: {
        x: Number,
        y: Number,
        config: null,
        zoom: Number,
    },

    data() {
        return {
        };
    },

    methods: {
    },

    computed: {
    },
}

</script>

<template>
    <!-- Pointer -->
    <v-group v-if="x !== null && y !== null" :config="{ x: x, y: y }">
        <v-line :config="{
            points: [
                -config.coordinates_indicator_size / 2 / zoom, 0,
                +config.coordinates_indicator_size / 2 / zoom, 0,
            ],
            stroke: config.coordinates_indicator_color,
            strokeWidth: config.coordinates_indicator_border,
            strokeScaleEnabled: false,
            listening: false,
        }" />
        <v-line :config="{
            points: [
                0, -config.coordinates_indicator_size / 2 / zoom,
                0, +config.coordinates_indicator_size / 2 / zoom,
            ],
            stroke: config.coordinates_indicator_color,
            strokeWidth: config.coordinates_indicator_border,
            strokeScaleEnabled: false,
            listening: false,
        }" />
    </v-group>
</template>