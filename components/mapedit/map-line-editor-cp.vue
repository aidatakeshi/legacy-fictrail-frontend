<script>
    export default {

        props: {
            x: Number,
            y: Number,
            xOrigin: Number,
            yOrigin: Number,
            zoom: Number,
            config: null,
            cp: Array,
            listening: Boolean,
            //
            section: Boolean,
            segment: Boolean,
            bezier: Boolean,
            isNextLineSegment: Boolean,
        },

        watch: {
        },

        data() {
            return {
            };
        },

        async mounted(){
            
        },

        methods: {
            handleClicked(event){
                this.$emit('click', this.cp);
            },
            handleRightClicked(event){
                event.evt.preventDefault();
                this.$emit('menu', event, this.cp, this.isNextLineSegment);
            },
            handleMobileClicked(event){
                this.$emit('click', this.cp);
                this.$emit('menu', event, this.cp);
            },
            handleDragStart(event){
                var x = event.target.x();
                var y = event.target.y();
                this.$emit('dragstart', this.cp, x, y);
            },
            handleDragMove(event){
                var x = event.target.x();
                var y = event.target.y();
                this.$emit('dragmove', this.cp, x, y);
            },
            handleDragEnd(event){
                var x = event.target.x();
                var y = event.target.y();
                this.$emit('dragend', this.cp, x, y);
            },
        },

        computed: {
            line_cp_section_border(){
                return this.config.line_cp_section_border(this.zoom);
            },
            line_cp_segment_size(){
                return this.config.line_cp_segment_size(this.zoom) / this.zoom;
            },
            line_cp_segment_border(){
                return this.config.line_cp_segment_border(this.zoom);
            },
            line_cp_bezier_size(){
                return this.config.line_cp_bezier_size(this.zoom) / this.zoom;
            },
            line_cp_bezier_border(){
                return this.config.line_cp_bezier_border(this.zoom);
            },
        },
    }

</script>

<template>
    <v-group>

        <!-- Connecting Line (Bezier Mode Only) -->
        <v-line v-if="bezier" :config="{
            points: [ x, y, xOrigin, yOrigin ],
            stroke: 'black',
            opacity: config.line_cp_bezier_alpha,
            strokeWidth: line_cp_bezier_border,
            strokeScaleEnabled: false,
            listening: false,
        }" />

        <!-- Draggable Part -->
        <v-group :config="{ x: x, y: y, draggable: true }"
        @mouseup="handleClicked" @touchend="handleMobileClicked" @contextmenu="handleRightClicked"
        @dragstart="handleDragStart" @dragmove="handleDragMove" @dragend="handleDragEnd">

            <!-- Section Indicator (Circle Dot) -->
            <v-group v-if="section">
                <!-- Hit -->
                <v-circle :config="{
                    radius: config.line_cp_section_hit_radius(zoom) / zoom,
                    opacity: 0,
                }" />
                <!-- Display -->
                <v-circle :config="{
                    radius: config.line_cp_section_radius(zoom) / zoom,
                    fill: 'black',
                    stroke: 'white',
                    strokeWidth: line_cp_section_border,
                    fillAfterStrokeEnabled: true,
                    strokeScaleEnabled: false,
                    listening: false,
                }" />
            </v-group>

            <!--  Segment Indicator (Cross) -->
            <v-group v-else-if="segment">
                <!-- Hit -->
                <v-circle :config="{
                    radius: config.line_cp_segment_hit_radius(zoom) / zoom,
                    opacity: 0,
                }" />
                <!-- Display -->
                <v-line :config="{
                    points: [
                        -line_cp_segment_size/2, -line_cp_segment_size/2,
                        +line_cp_segment_size/2, +line_cp_segment_size/2,
                    ],
                    stroke: 'black',
                    strokeWidth: line_cp_segment_border,
                    strokeScaleEnabled: false,
                    listening: false,
                }" />
                <v-line :config="{
                    points: [
                        +line_cp_segment_size/2, -line_cp_segment_size/2,
                        -line_cp_segment_size/2, +line_cp_segment_size/2,
                    ],
                    stroke: 'black',
                    strokeWidth: line_cp_segment_border,
                    strokeScaleEnabled: false,
                    listening: false,
                }" />
            </v-group>

            <!--  Bezier Control Point (Cross) -->
            <v-group v-else-if="bezier">
                <!-- Hit -->
                <v-circle :config="{
                    radius: config.line_cp_bezier_hit_radius(zoom) / zoom,
                    opacity: 0,
                }" />
                <!-- Display -->
                <v-line :config="{
                    points: [
                        -line_cp_bezier_size/2, -line_cp_bezier_size/2,
                        +line_cp_segment_size/2, +line_cp_bezier_size/2,
                    ],
                    stroke: 'black',
                    opacity: config.line_cp_bezier_alpha,
                    strokeWidth: line_cp_bezier_border,
                    strokeScaleEnabled: false,
                    listening: false,
                }" />
                <v-line :config="{
                    points: [
                        +line_cp_bezier_size/2, -line_cp_bezier_size/2,
                        -line_cp_bezier_size/2, +line_cp_bezier_size/2,
                    ],
                    stroke: 'black',
                    opacity: config.line_cp_bezier_alpha,
                    strokeWidth: line_cp_bezier_border,
                    strokeScaleEnabled: false,
                    listening: false,
                }" />
            </v-group>

            <!------------------------------------------------------------------------------------>
        </v-group>

    </v-group>
</template>