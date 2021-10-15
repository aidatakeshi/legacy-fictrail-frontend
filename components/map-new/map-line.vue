<script>

    export default {
        
        props: {
            line: Object,
            lineType: Object,
            config: null,
            zoom: Number,
            selected: Boolean,
            editable: Boolean,
            listening: Boolean,
            trigger: null,
        },

        data() {
            return {
            };
        },

        watch: {
            trigger(){
                this.$forceUpdate();
            },
        },

        async mounted(){
        },

        methods: {
            lineCtx(ctx, shape){
                ctx.beginPath();
                var firstSection = true;
                for (var i in this.line.stations){
                    var segments = this.line.stations[i].segments;
                    if (this.line.stations[i].to_remove) continue;
                    if (segments.length){
                        if (firstSection){
                            ctx.moveTo(segments[0].x, segments[0].y);
                            firstSection = false;
                        }else{
                            ctx.lineTo(segments[0].x, segments[0].y);
                        }
                        for (var j = 1; j < segments.length; j++){
                            var segment = segments[j];
                            var segment_prev = segments[j-1];
                            var x = segment.x;
                            var y = segment.y;
                            //Check if Bezier Curve
                            var isBezier = true;
                            if (!isFinite(segment.x2) || !isFinite(segment.y2)) isBezier = false;
                            if (!isFinite(segment_prev.x1) || !isFinite(segment_prev.y1)) isBezier = false;
                            //... Bezier Curve
                            if (isBezier){
                                var x1 = (segment_prev.x - (-segment_prev.x1));
                                var y1 = (segment_prev.y - (-segment_prev.y1));
                                var x2 = (segment.x - (-segment.x2));
                                var y2 = (segment.y - (-segment.y2));
                                ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
                            }
                            //... Simple Straight Line
                            else{
                                ctx.lineTo(x, y);
                            }
                        }
                    }
                }
                ctx.fillStrokeShape(shape);
            },
            
            handleLineClicked(event){
                this.$emit('click', event, this.line?.id);
            },
            handleRightClick(event){
                event.evt.preventDefault();
            },
        },

        computed: {
            isMajor(){
                return this.lineType?.major;
            },
            line_color(){
                return (this.isMajor ? this.line?.color : this.lineType?.color);
            },
            line_border(){
                return (this.isMajor ?
                    this.config.line_major_border(this.zoom) :
                    this.config.line_minor_border(this.zoom)
                );
            },
            line_decoration_border(){
                return (this.isMajor ?
                    this.config.line_major_decoration_border(this.zoom) :
                    this.config.line_minor_decoration_border(this.zoom)
                );
            },
            line_decoration_dash1(){
                return (this.isMajor ?
                    this.config.line_major_decoration_dash1(this.zoom) :
                    this.config.line_minor_decoration_dash1(this.zoom)
                );
            },
            line_decoration_dash2(){
                return (this.isMajor ?
                    this.config.line_major_decoration_dash2(this.zoom) :
                    this.config.line_minor_decoration_dash2(this.zoom)
                );
            },
            line_decoration_color(){
                return (this.isMajor ?
                    this.config.line_major_decoration_color :
                    this.config.line_minor_decoration_color
                );
            },
        },
    }

</script>

<template>
    <v-group v-if="line"
    @mouseup="handleLineClicked" @touchend="handleLineClicked" @contextmenu="handleRightClick">
        <!-- Hit Line -->
        <v-shape :config="{
            sceneFunc: lineCtx,
            stroke: 'black',
            opacity: 0,
            strokeWidth: config.line_hit_border(zoom),
            strokeScaleEnabled: false,
            fillEnabled: false,
            listening: listening,
        }" />
        <!-- Line Highlighter (Bottom) -->
        <v-shape v-if="selected" :config="{
            sceneFunc: lineCtx,
            stroke: config.line_selected_highlighter,
            strokeWidth: line_border * config.line_selected_highlighter_border_ratio,
            strokeScaleEnabled: false,
            fillEnabled: false,
            listening: false,
        }" />
        <!-- Displayed Line -->
        <v-shape :config="{
            sceneFunc: lineCtx,
            stroke: line_color,
            strokeWidth: line_border,
            strokeScaleEnabled: false,
            fillEnabled: false,
            listening: false,
        }"/>
        <!-- Displayed Line -->
        <v-shape :config="{
            sceneFunc: lineCtx,
            stroke: line_decoration_color,
            strokeWidth: line_decoration_border,
            dash: [ line_decoration_dash1, line_decoration_dash2 ],
            strokeScaleEnabled: false,
            fillEnabled: false,
            listening: false,
        }"/>
    </v-group>
</template>