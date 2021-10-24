<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {

        layout: "dashboard",

        data() {
            return {
                modify_curve: {
                    operator: null,
                    line: null,
                    station: null,
                    line2: null,
                    //
                    line_station_id: null,
                    segments_old: [],
                    segments_new: [],
                    station_prev: null,
                    station_name_prev: null,
                    station_name: null,
                    error_station: false,
                    error_line2: false,
                    success: false,
                },
            }
        },

        async mounted(){
        },

        methods: {

            modify_curve_reset(){
                this.modify_curve.line_station_id = null;
                this.modify_curve.segments_old = [];
                this.modify_curve.segments_new = [];
                this.modify_curve.station_prev = null;
                this.modify_curve.station_name_prev = null;
                this.modify_curve.station_name = null;
                this.modify_curve.error_station = false;
                this.modify_curve.error_line2 = false;
                this.modify_curve.success = false;
            },

            async modify_curve_station_updated(){
                this.modify_curve_reset();
                //Check Segments
                if (!this.modify_curve.line) return false;
                if (!this.modify_curve.station) return false;
                var $route = `line/${encodeURIComponent(this.modify_curve.line)}/stations?show_segments=1`;
                var response = await $.callAPI(axios, "GET", $route);
                if (response.http_status >= 400) return false;
                if (!response.data.length) return false;
                for (var i in response.data){
                    var item = response.data[i];
                    var item_prev = response.data[i-1] || {};
                    if (item.station_id == this.modify_curve.station){
                        this.modify_curve.line_station_id = item.id;
                        this.modify_curve.station_prev = item_prev.station_id;
                        this.modify_curve.station_name = (item.station||{}).name_chi;
                        this.modify_curve.station_name_prev = (item_prev.station||{}).name_chi;
                        this.modify_curve.segments_old = item.segments;
                        //If no segments, fail
                        if ((item.segments||{}).length < 2){
                            return this.modify_curve.error_station = true;
                        }else{
                            return this.modify_curve.error_station = false;
                        }
                    }
                }
            },

            async modify_curve_line2_updated(){
                if (!this.modify_curve.line2) return false;
                if (!this.modify_curve.station) return false;
                if (!this.modify_curve.station_prev) return false;
                var $route = `line/${encodeURIComponent(this.modify_curve.line2)}/stations?show_segments=1`;
                var response = await $.callAPI(axios, "GET", $route);
                if (response.http_status >= 400) return false;
                if (!response.data.length) return false;
                //Determine Beginning & Ending Index
                var begin_i = null; var end_i = null;
                for (var i in response.data){
                    if (response.data[i].station_id == this.modify_curve.station_prev) begin_i = i*1;
                    if (response.data[i].station_id == this.modify_curve.station) end_i = i*1;
                }
                if (begin_i === null || end_i === null || begin_i == end_i){
                    return this.modify_curve.error_line2 = true;
                }
                this.modify_curve.error_line2 = false;
                var segments_new = [];
                //If begin_i < end_i (asc)
                if (begin_i < end_i){
                    for (var i = begin_i+1; i <= end_i; i++){
                        for (var j = 0; j < response.data[i].segments.length; j++){
                            var segment = response.data[i].segments[j];
                            segments_new.push(segment);
                        }
                    }
                }
                //If end_i < begin_i (desc)
                else{
                    for (var i = begin_i; i >= end_i+1; i--){
                        for (var j = response.data[i].segments.length-1; j >= 0; j--){
                            var segment = response.data[i].segments[j];
                            [segment.x1, segment.x2] = [segment.x2 || null, segment.x1 || null];
                            [segment.y1, segment.y2] = [segment.y2 || null, segment.y1 || null];
                            segments_new.push(segment);
                        }
                    }
                }
                //Remove redundant segments (with exact x, y)
                for (var i = segments_new.length - 2; i >= 0; i--){
                    var same1 = segments_new[i].x == segments_new[i+1].x;
                    var same2 = segments_new[i].y == segments_new[i+1].y;
                    if (same1 && same2){
                        segments_new[i].x1 = segments_new[i+1].x1 || null;
                        segments_new[i].y1 = segments_new[i+1].y1 || null;
                        segments_new.splice(i+1, 1);
                    }

                }
                //
                this.modify_curve.segments_new = segments_new;
            },

            async modify_curve_submit(){
                if (this.modify_curve.error_station) return false;
                if (this.modify_curve.error_line2) return false;
                if (!this.modify_curve.line_station_id) return false;
                if (!this.modify_curve.segments_new.length) return false;
                var $route = `items/line_station/${encodeURIComponent(this.modify_curve.line_station_id)}`;
                var response = await $.callAPI(axios, "PATCH", $route, {
                    segments: this.modify_curve.segments_new,
                });
                if (response.http_status >= 400) return false;
                this.modify_curve.success = true;
            },

        },

    }

</script>

<template>
    <div class="my-4">
        <h1>地圖編輯輔助工具</h1>

        <b-card>
            <h2>統一平行路線曲線</h2>

            <div>「參考路線」須設有與「修改路線」相同的車站，但可設有中途站。</div>

            <div class="row">
                <div class="col-sm-6 col-lg-3">
                    <strong>營運者</strong>
                    <select-item type="operator" v-model="modify_curve.operator" @change="modify_curve_reset" />
                </div>
                <div class="col-sm-6 col-lg-3">
                    <strong>修改路線</strong>
                    <select-item type="line of operator" v-model="modify_curve.line"
                    :filter="modify_curve.operator" @change="modify_curve_reset" />
                </div>
                <div class="col-sm-6 col-lg-3">
                    <strong>區間 <small>(請選擇下方車站)</small></strong>
                    <select-station-of-line :line-id="modify_curve.line" v-model="modify_curve.station"
                    @change="modify_curve_station_updated" />
                </div>
                <div class="col-sm-6 col-lg-3">
                    <strong>參考路線</strong>
                    <select-line-of-station :station-id="modify_curve.station" v-model="modify_curve.line2"
                    @change="modify_curve_line2_updated" />
                </div>
            </div>

            <div class="text-center mt-2">
                <b-button variant="primary" @click="modify_curve_submit" style="min-width: 50vw;">提交</b-button>
            </div>

            <div class="text-success" v-if="modify_curve.success">修改成功</div>

            <div class="text-danger" v-if="modify_curve.error_station">
                錯誤：此區間本身並沒有線段 (例如路線第一個車站)
            </div>
            <div class="text-danger" v-if="modify_curve.error_line2">
                錯誤：此路線與「修改路線」並沒有重複相關車站
            </div>

            <div class="row">
                <div class="col-sm-6">
                    <strong>line_station ID: </strong>{{modify_curve.line_station_id}}<br/>
                    <strong>Segments (舊):</strong>
                    <vue-json-pretty style="border: solid 1px grey;" :data="modify_curve.segments_old" />
                </div>
                <div class="col-sm-6">
                    <strong>{{modify_curve.station_name_prev}} → {{modify_curve.station_name}}</strong><br/>
                    <strong>Segments (新):</strong>
                    <vue-json-pretty style="border: solid 1px grey;" :data="modify_curve.segments_new" />
                </div>
            </div>

        </b-card>

    </div>
</template>