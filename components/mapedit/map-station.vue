<script>
    export default {

        props: {
            station: Object,
            commonjs: null,
            config: null,
            zoom: Number,
            selected: Boolean,
            editable: Boolean,
            listening: Boolean,
            trigger: null,
        },

        watch: {
            trigger(){
                this.$forceUpdate();
            },
        },

        data() {
            return {
            };
        },

        async mounted(){
        },

        methods: {
            handleClick(event){
                this.$emit('click', event, this.station?.id);
            },
            handleMouseEnter(event){
                this.$emit('mouseenter', event, this.station?.id);
            },
            handleMouseLeave(event){
                this.$emit('mouseleave', event, this.station?.id);
            },
            handleDragStart(event){
                this.$emit('dragstart', event, this.station?.id);
            },
            handleDragMove(event){
                this.$emit('dragmove', event, this.station?.id);
            },
            handleDragEnd(event){
                this.$emit('dragend', event, this.station?.id);
            },
            handleRightClicked(event){
                event.evt.preventDefault();
            },
        },

        computed: {
            display_zoom_min(){
                return (this.station.major ?
                    this.config.station_major_display_zoom_min :
                    this.config.station_minor_display_zoom_min
                );
            },
            station_name_label_display_zoom_min(){
                return (this.station.major ?
                    this.config.station_name_label_major_display_zoom_min :
                    this.config.station_name_label_minor_display_zoom_min
                );
            },
            station_radius(){
                return (this.station.major ?
                    this.config.station_major_radius(this.zoom) :
                    this.config.station_minor_radius(this.zoom)
                ) / this.zoom;
            },
            station_border(){
                return (this.station.major ?
                    this.config.station_major_border(this.zoom) :
                    this.config.station_minor_border(this.zoom)
                );
            },
            cross_size(){
                return this.config.station_abandoned_cross_size(this.zoom) / 2 / this.zoom;
            },
            labelFontSize(){
                if (this.station.major) return this.config.station_name_label_major_font_size / this.zoom;
                return this.config.station_name_label_minor_font_size / this.zoom;
            },
            labelWidth(){
                if (this.station.major) return this.config.station_name_label_major_width / this.zoom;
                return this.config.station_name_label_minor_width / this.zoom;
            },
        },
    }

</script>

<template>
    <v-group v-if="station"
        :config="{
            x: parseFloat(station.x),
            y: parseFloat(station.y),
            draggable: this.selected && this.editable,
        }"
        @mouseup="handleClick" @touchend="handleClick"
        @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
        @contextmenu="handleRightClicked"
        @dragstart="handleDragStart" @dragmove="handleDragMove" @dragend="handleDragEnd"
    >
        <template v-if="zoom >= display_zoom_min">
            <!-- Hit Circle -->
            <v-circle :config="{
                opacity: 0,
                radius: config.station_hit_radius(zoom) / zoom,
                listening: listening,
            }" />
            <!-- Station Highlighter (Bottom) -->
            <v-circle v-if="selected" :config="{
                fill: config.station_selected_highlighter,
                radius: station_radius * config.station_selected_highlighter_border_ratio,
                listening: false,
            }" />
            <!-- Station Circle -->
            <v-circle :config="{
                fill: 'white',
                stroke: 'black',
                radius: station_radius,
                strokeWidth: station_border,
                strokeScaleEnabled: false,
                listening: false,
            }" v-if="!station.is_signal_only" />
            <!-- Signal Station -->
            <v-rect :config="{
                fill: 'white',
                stroke: 'black',
                width: config.station_signal_side(zoom) / zoom / Math.SQRT2,
                height: config.station_signal_side(zoom) / zoom / Math.SQRT2,
                offsetX: config.station_signal_side(zoom) / zoom / Math.SQRT2 / 2,
                offsetY: config.station_signal_side(zoom) / zoom / Math.SQRT2 / 2,
                rotation: 45,
                strokeWidth: station_border,
                strokeScaleEnabled: false,
                listening: false,
            }" v-else />
            <!-- Station Highlighter (Overlay) -->
            <v-circle v-if="selected" :config="{
                fill: config.station_selected_highlighter,
                opacity: config.station_selected_highlighter_alpha,
                radius: station_radius * config.station_selected_highlighter_border_ratio,
                listening: false,
            }" />
        </template>
        <!-- Station Name Label -->
        <v-text v-if="zoom >= station_name_label_display_zoom_min" :config="{
            y: station_radius + config.station_name_label_y_shift / zoom,
            text: station.name_chi,
            fontSize: labelFontSize,
            width: labelWidth,
            offsetX: labelWidth / 2,
            align: 'center',
            fontStyle: 'bold',
            listening: false,
        }" />
        <!-- Cross Line for Abandoned Station -->
        <v-group v-if="station.is_abandoned">
            <v-line :config="{
                stroke: 'black',
                strokeWidth: config.station_abandoned_cross_border(zoom),
                strokeScaleEnabled: false,
                points: [
                    -cross_size, -cross_size,
                    +cross_size, +cross_size,
                ],
                listening: false,
            }" />
            <v-line :config="{
                stroke: 'black',
                strokeWidth: config.station_abandoned_cross_border(zoom),
                strokeScaleEnabled: false,
                points: [
                    +cross_size, -cross_size,
                    -cross_size, +cross_size,
                ],
                listening: false,
            }" />
        </v-group>

        <!------------------------------------------------------------------------------>
    </v-group>
</template>