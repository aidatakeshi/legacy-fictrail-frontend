<script>
    const schdiagram_config = require('~/schdiagram-config.js');
    const $ = require('~/common.js');

    export default {
        props: {
            data: Array,
            xscale: Number,
            yscale: Number,
            xpos: Number,
            ypos: Number,
            contentWidth: Number,
            contentHeight: Number,
            config: Object,
        },

        data() {
            return {
                sdc: schdiagram_config,
                x: null,
            };
        },

        watch: {
        },

        methods: {
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

            //Get Captions
            getCaptions(trip, index){
               var arr = [];
               //Train Type / Name / Number
               var str = trip.train_type?.name_chi;
               if (trip.train_name?.name_chi) str += ` ${trip.train_name?.name_chi}`;
               if (trip.train_number) str += `${trip.train_number}號`;
               arr.push(str);
               //Begin / Terminate Stations
               arr.push(`${trip.station_begin_name_chi} → ${trip.station_terminate_name_chi}`);
               //Arrive / Depart
               var item = trip.schedule_line[index];
               if (item){
                   if (item.is_pass){
                       if (item.time1 !== null || item.time2 !== null){
                           arr.push(`${$.displayTime(item.time2 || item.time1)}通過`);
                       }else if (item.time1 !== null && item.time2 !== null){
                           arr.push(`${$.displayTime(item.time1)}到達 / ${$.displayTime(item.time2)}再開 (運轉停車)`);
                       }else{
                           arr.push(`通過 (沒有設定時刻)`);
                       }
                   }else{
                       if (item.time1 !== null && item.time2 !== null){
                           arr.push(`${$.displayTime(item.time1)}到着 / ${$.displayTime(item.time2)}發車`);
                       }else if (item.time1 !== null){
                           arr.push(`${$.displayTime(item.time1)}到着`);
                       }else if (item.time2 !== null){
                           arr.push(`${$.displayTime(item.time2)}發車`);
                       }
                   }
               }
               //Track No
               if (item.track){
                    arr.push(`月台/線路: ${item.track}`);
               }
               //Return array
               return arr;
            },

            //Mouse / Touch Handlers
            handleTouch(event, trip, index){
                var touch = event.evt.touches?.[0];
                var x = touch?.clientX;
                var y = touch?.clientY;
                this.$emit('show-tooltip', this.getCaptions(trip, index), x, y, true);
            },
            handleMouseEnter(event, trip, index){
                var x = event.evt.clientX;
                var y = event.evt.clientY;
                this.$emit('show-tooltip', this.getCaptions(trip, index), x, y, false);
            },
            handleMouseLeave(event){
                this.$emit('hide-tooltip');
            },
        },

        computed: {
            displayed_x_min(){
                return this.basisWidth * this.xpos - this.contentWidth / 2 / this.xscale;
            },
            displayed_x_max(){
                return this.basisWidth * this.xpos + this.contentWidth / 2 / this.xscale;
            },
        },
    }

</script>

<template>
    <v-group :config="config">
        <v-group v-for="(trip, i) in data" :key="i">
            <template v-for="(item, n) in getTouchPoints(trip)">
                <v-rect :key="n" :config="{
                    x: item.x - sdc.line_point_detect_width / 2 / xscale - sdc.hour_start * 3600,
                    y: item.y - sdc.line_point_detect_height / 2 / yscale,
                    width: item.w + sdc.line_point_detect_width / xscale,
                    height: sdc.line_point_detect_height / yscale,
                    fill: 'red',
                    opacity: 0,
                }"
                @touchstart="handleTouch($event, trip, item.i)"
                @mouseenter="handleMouseEnter($event, trip, item.i)"
                @mouseleave="handleMouseLeave($event, trip, item.i)" />
            </template>
        </v-group>
    </v-group>
</template>