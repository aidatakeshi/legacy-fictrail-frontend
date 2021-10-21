<script>

    export default {
        
        props: {
            segment1: Object,
            segment2: Object,
            config: null,
            zoom: Number,
            sectionIndex: Number,
            segmentIndex: Number,
        },

        data() {
            return {
            };
        },

        watch: {
        },

        async mounted(){
        },

        methods: {
            segmentCtx(ctx, shape){
                ctx.beginPath();
                ctx.moveTo(this.segment1.x, this.segment1.y);
                //Check if Bezier Curve
                var x = this.segment2.x;
                var y = this.segment2.y;
                var isBezier = true;
                if (!isFinite(this.segment2.x2) || !isFinite(this.segment2.y2)) isBezier = false;
                if (!isFinite(this.segment1.x1) || !isFinite(this.segment1.y1)) isBezier = false;
                //... Bezier Curve
                if (isBezier){
                    var x1 = (this.segment1.x - (-this.segment1.x1));
                    var y1 = (this.segment1.y - (-this.segment1.y1));
                    var x2 = (this.segment2.x - (-this.segment2.x2));
                    var y2 = (this.segment2.y - (-this.segment2.y2));
                    ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
                }
                //... Simple Straight Line
                else{
                    ctx.lineTo(x, y);
                }
                ctx.fillStrokeShape(shape);
            },
            handleLineClicked(event){
                this.$emit('click', event, this.sectionIndex, this.segmentIndex);
            },
            handleRightClicked(event){
                event.evt.preventDefault();
                this.$emit('menu', event, this.sectionIndex, this.segmentIndex);
            },
        },

        computed: {
        },
    }

</script>

<template>
    <v-group v-if="segment1 && segment2">
        <v-shape :config="{
            sceneFunc: segmentCtx,
            stroke: 'black',
            opacity: 0,
            strokeWidth: config.line_hit_border(zoom),
            strokeScaleEnabled: false,
            fillEnabled: false,
        }" @mouseup="handleLineClicked" @touchend="handleLineClicked" @contextmenu="handleRightClicked" />
    </v-group>
</template>