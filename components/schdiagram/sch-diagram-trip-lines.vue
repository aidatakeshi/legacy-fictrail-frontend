<script>
    const schdiagram_config = require('~/schdiagram-config.js');

    export default {
        props: {
            data: Array,
            dataDirection: String,
            xscale: Number,
            yscale: Number,
            xpos: Number,
            ypos: Number,
            contentWidth: Number,
            contentHeight: Number,
            config: Object,
            direction: String,
            expressTrack: Boolean,
            showOppositeDirection: Number,
            showAnotherTrack: Boolean,
        },

        data() {
            return {
                sdc: schdiagram_config,
                points: [],
            };
        },

        mounted(){

        },

        watch: {
        },

        methods: {
            //Get Trip Lines Config
            getTripLines(trip){
                if (!trip) return [];
                var arr = [];
                //Determine Stroke Color
                var stroke_color = trip.train_name?.color || trip.train_type?.color;
                //For Each Station...
                for (var i = 0; i < trip.schedule_line.length - 1; i++){
                    var item1 = trip.schedule_line[i];
                    var item2 = trip.schedule_line[i+1];
                    if (!item1 || !item2) continue;
                    var points = [];
                    //item1_time
                    if (item1.time1 !== null && item1.time2 !== null){
                        points.push(item1.time1 - this.sdc.hour_start * 3600, item1.mileage_km);
                        points.push(item1.time2 - this.sdc.hour_start * 3600, item1.mileage_km);
                    }else if (item1.time2 !== null){
                        points.push(item1.time2 - this.sdc.hour_start * 3600, item1.mileage_km);
                    }else if (item1.time1 !== null){
                        points.push(item1.time1 - this.sdc.hour_start * 3600, item1.mileage_km);
                    }else{
                        points.push((item1.time_intepolated || 0) - this.sdc.hour_start * 3600, item1.mileage_km);
                    }
                    //item2_time
                    if (item2.time1 !== null && item2.time2 !== null){
                        points.push(item2.time1 - this.sdc.hour_start * 3600, item2.mileage_km);
                        points.push(item2.time2 - this.sdc.hour_start * 3600, item2.mileage_km);
                    }else if (item2.time1 !== null){
                        points.push(item2.time1 - this.sdc.hour_start * 3600, item2.mileage_km);
                    }else if (item2.time2 !== null){
                        points.push(item2.time2 - this.sdc.hour_start * 3600, item2.mileage_km);
                    }else{
                        points.push((item2.time_intepolated || 0) - this.sdc.hour_start * 3600, item2.mileage_km);
                    }
                    //points
                    var direction = this.dataDirection;
                    var isExpressTrack = item1.is_express_track;
                    var tracks = item1.no_tracks;
                    arr.push({
                        stroke_color: stroke_color,
                        line_display_mode: this.getLineDisplayMode(direction, isExpressTrack, tracks),
                        points: points,
                    });
                }
                //Return array
                return arr;
            },

            //Get Touch Points
            getTouchPoints(trip){
                if (!trip) return [];
                var arr = [];
                //For Each Station...
                for (var i = 0; i < trip.schedule_line.length; i++){
                    var item = trip.schedule_line[i];
                    if (!item) continue;
                    if (item.time1 !== null && item.time2 !== null){
                        arr.push({i: i, x: item.time1, y: item.mileage_km, w: item.time2 - item.time1});
                    }else if (item.time2 !== null){
                        arr.push({i: i, x: item.time2, y: item.mileage_km, w: 0});
                    }else if (item.time1 !== null){
                        arr.push({i: i, x: item.time1, y: item.mileage_km, w: 0});
                    }else{
                        arr.push({i: i, x: item.time_intepolated || 0, y: item.mileage_km, w: 0});
                    }
                }
                //Return array
                return arr;
            },

            //Line Display Mode (2: normal; 1: low-key: 0: none)
            getLineDisplayMode(direction, isExpressTrack, tracks){
                //Single Track
                if (tracks == 1){
                    if (this.direction === null || this.direction === direction) return 2;
                    if (this.showOppositeDirection == 4 || this.showOppositeDirection == 2) return 2;
                    if (this.showOppositeDirection == 1 || this.showOppositeDirection == 3) return 1;
                    return 0;
                }
                //Double Track (or Quadraple Track showing both)
                if (tracks == 2 || (tracks == 4 && this.expressTrack === null)){
                    if (this.direction === null || this.direction === direction) return 2;
                    if (this.showOppositeDirection == 3 || this.showOppositeDirection == 4) return 1;
                    return 0;
                }
                //Quadraple Track (showing only either exp / loc)
                if (tracks == 4){
                    var is_another_track = (this.expressTrack != isExpressTrack);
                    if (this.direction === null || this.direction === direction){
                        return (!is_another_track) ? 2 : (this.showAnotherTrack) ? 1 : 0;
                    }
                    if (this.showOppositeDirection == 3 || this.showOppositeDirection == 4){
                        return (!is_another_track) ? 1 : (this.showAnotherTrack) ? 1 : 0;
                    }
                    return 0;
                }
            },

            //Get min/max time of trip
            isTripDisplayed(trip){
                for (var i = 0; i < trip.schedule_line.length; i++){
                    if (trip.schedule_line[i]){
                        if (trip.schedule_line[i].time2){
                            var time2 = trip.schedule_line[i].time2;
                            break;
                        }
                    }
                }
                for (var i = trip.schedule_line.length - 1; i >= 0; i--){
                    if (trip.schedule_line[i]){
                        if (trip.schedule_line[i].time1){
                            var time1 = trip.schedule_line[i].time1;
                            break;
                        }
                    }
                }
                var time_min = Math.min(time2, time1) - schdiagram_config.hour_start * 3600;
                var time_max = Math.max(time2, time1) - schdiagram_config.hour_start * 3600;
                if (time_min > this.displayed_x_max) return false;
                if (time_max < this.displayed_x_min) return false;
                return true;
            },
        },

        computed: {
            displayed_x_min(){
                return this.basisWidth * this.xpos - this.contentWidth / 2 / this.xscale;
            },
            displayed_x_max(){
                return this.basisWidth * this.xpos + this.contentWidth / 2 / this.xscale;
            },
            basisWidth(){
                return 86400;
            },
        },
    }

</script>

<template>
    <v-group :config="config">
        <v-group v-for="(trip, i) in data" :key="i">
            <template v-if="isTripDisplayed(trip)">
                <template v-for="(line, j) in getTripLines(trip)">
                    <!-- Line (Normal) -->
                    <v-line v-if="line.line_display_mode == 2" :key="+j" :config="{
                        points: line.points,
                        stroke: line.stroke_color,
                        dash: trip.is_temp ? sdc.line_dash : null,
                        strokeWidth: sdc.line_normal_width,
                        strokeScaleEnabled: false,
                    }" />
                    <!-- Line (Low-key) -->
                    <v-line v-else-if="line.line_display_mode == 1" :key="j" :config="{
                        points: line.points,
                        stroke: line.stroke_color,
                        dash: trip.is_temp ? sdc.line_dash : null,
                        strokeWidth: sdc.line_lowkey_width,
                        opacity: sdc.line_lowkey_opacity,
                        strokeScaleEnabled: false,
                    }" />
                </template>
            </template>
        </v-group>
    </v-group>
</template>