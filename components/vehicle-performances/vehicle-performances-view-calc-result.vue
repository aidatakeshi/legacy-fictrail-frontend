<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPencil, BIconPlus } from 'bootstrap-vue'

    export default {

        props: {
            itemId: null,
        },
        components: { BIcon, BIconPencil, BIconPlus },

        data() {
            return {
                data: {},
                chart: "accel",
                xAxes: [{
                    ticks: {min: 0, stepSize: 5}, 
                    scaleLabel: { display: true, labelString: '速度 (km/h)'},
                }],
                tooltips: {
                    callbacks: {
                        label: function(ti, data) {
                            return (ti.xLabel) + ': ' + (ti.yLabel).toFixed(2);
                        }
                    }
                },
            }
        },

        async mounted(){
            var response = await $.callAPI(axios, "GET", "items/vehicle_performance_items/"+encodeURI(this.itemId), {});
            if (response.http_status != 200) return false;
            this.data = response.data;
        },

        methods: {
            //Display Digits
            d(value, digits){
                if (typeof value !== 'number') return null;
                return value.toFixed(digits);
            },
        },

        computed: {
            chart_options(){
                return {
                    "accel": {
                        scales: {
                            xAxes: this.xAxes,
                            yAxes: [{
                                ticks: {min: 0, stepSize: 0.1},
                                scaleLabel: { display: true, labelString: '(km/h/s)'},
                            }],
                        },
                        tooltips: this.tooltips,
                    },
                    "dist": {
                        scales: {
                            xAxes: this.xAxes,
                            yAxes: [{
                                ticks: {min: 0, stepSize: 100},
                                scaleLabel: { display: true, labelString: '所要距離 (m)'},
                            }],
                        },
                        tooltips: this.tooltips,
                    },
                    "time": {
                        scales: {
                            xAxes: this.xAxes,
                            yAxes: [{
                                ticks: {min: 0, stepSize: 5},
                                scaleLabel: { display: true, labelString: '所要時間 (s)'},
                            }],
                        },
                        tooltips: this.tooltips,
                    },
                };
            },
            data_accel(){
                var values_accel = [];
                var values_decel = [];
                var values_equiv = [];
                for (var v = 0; v <= this.data.max_speed_kph; v++){
                    values_accel.push({x: v, y: (this.data.calc_results_by_kph[v]||{}).accel || 0});
                    values_decel.push({x: v, y: (this.data.calc_results_by_kph[v]||{}).decel || 0});
                    values_equiv.push({x: v, y: (this.data.calc_results_by_kph[v]||{}).equiv_accel || 0});
                }
                return {
                    datasets: [
                        {
                            label: '加速度', data: values_accel,
                            borderColor: '#060', borderWidth: 2, showLine: true, fill: false,
                            pointRadius: 0, pointHitRadius: 3, lineTension: 0,
                        },
                        {
                            label: '減速度', data: values_decel,
                            borderColor: '#600', borderWidth: 2, showLine: true, fill: false,
                            pointRadius: 0, pointHitRadius: 3, lineTension: 0,
                        },
                        {
                            label: '等效加減速度', data: values_equiv,
                            borderColor: '#006', borderWidth: 2, showLine: true, fill: false,
                            pointRadius: 0, pointHitRadius: 3, lineTension: 0,
                        },
                    ],
                };
            },
            data_time(){
                var values_accel = [];
                var values_decel = [];
                var values_total = [];
                for (var v = 0; v <= this.data.max_speed_kph; v++){
                    values_accel.push({x: v, y: (this.data.calc_results_by_kph[v]||{}).accel_time || 0});
                    values_decel.push({x: v, y: (this.data.calc_results_by_kph[v]||{}).decel_time || 0});
                    values_total.push({x: v, y: (this.data.calc_results_by_kph[v]||{}).total_time || 0});
                }
                return {
                    datasets: [
                        {
                            label: '加速', data: values_accel,
                            borderColor: '#060', borderWidth: 2, showLine: true, fill: false,
                            pointRadius: 0, pointHitRadius: 3, lineTension: 0,
                        },
                        {
                            label: '減速', data: values_decel,
                            borderColor: '#600', borderWidth: 2, showLine: true, fill: false,
                            pointRadius: 0, pointHitRadius: 3, lineTension: 0,
                        },
                        {
                            label: '合計', data: values_total,
                            borderColor: '#006', borderWidth: 2, showLine: true, fill: false,
                            pointRadius: 0, pointHitRadius: 3, lineTension: 0,
                        },
                    ],
                };
            },
            data_dist(){
                var values_accel = [];
                var values_decel = [];
                var values_total = [];
                for (var v = 0; v <= this.data.max_speed_kph; v++){
                    values_accel.push({x: v, y: (this.data.calc_results_by_kph[v]||{}).accel_dist || 0});
                    values_decel.push({x: v, y: (this.data.calc_results_by_kph[v]||{}).decel_dist || 0});
                    values_total.push({x: v, y: (this.data.calc_results_by_kph[v]||{}).total_dist || 0});
                }
                return {
                    datasets: [
                        {
                            label: '加速', data: values_accel,
                            borderColor: '#060', borderWidth: 2, showLine: true, fill: false,
                            pointRadius: 0, pointHitRadius: 3, lineTension: 0,
                        },
                        {
                            label: '減速', data: values_decel,
                            borderColor: '#600', borderWidth: 2, showLine: true, fill: false,
                            pointRadius: 0, pointHitRadius: 3, lineTension: 0,
                        },
                        {
                            label: '合計', data: values_total,
                            borderColor: '#006', borderWidth: 2, showLine: true, fill: false,
                            pointRadius: 0, pointHitRadius: 3, lineTension: 0,
                        },
                    ],
                };
            },
            chart_data(){
                return {
                    accel: this.data_accel,
                    time: this.data_time,
                    dist: this.data_dist,
                }
            },
        },

    }

</script>

<template>
    <div>
        <h5>{{data.name_chi}}</h5>
        <pre v-if="data.remarks" class="mb-2" style="font-size: 90%;">{{data.remarks}}</pre>
        <hr class="my-2" />

        <div class="d-flex justify-content-start align-items-center flex-wrap mb-2" style="font-size: 90%;">
            <div class="mr-4"><b>最高速度：</b>{{d(data.max_speed_kph*1, 1)}} km/h</div>
            <div class="mr-4"><b>起動加速度：</b>{{d(data.max_accel_kph_s*1, 2)}} km/h/s</div>
            <div class="mr-4"><b>定加速上限：</b>{{d((data.calc_results_other || {}).const_accel_max_kph*1, 1)}} km/h</div>
            <div class="mr-4"><b>定出力上限：</b>{{d((data.calc_results_other || {}).const_power_max_kph*1, 1)}} km/h</div>
            <div class="mr-4"><b>平均每輛淨重：</b>{{d(data.empty_mass_avg_t*1, 1)}} t</div>
            <div class="mr-4"><b>滿員時載客量：</b>{{d(data.crush_capacity*1, 0)}} 人</div>
            <div class="mr-4"><b>滿員時重量：</b>{{d((data.calc_results_other || {}).crush_mass_t*1, 1)}} t</div>
            <div class="mr-4"><b>電動機定格出力：</b>{{d(data.motor_rated_kw*1, 1)}} kW</div>
            <div class="mr-4"><b>動力比：</b>{{d(data.motor_ratio*1, 1)}} %</div>
            <div class="mr-4"><b>平均每輛定格主力：</b>{{d((data.calc_results_other || {}).power_rated_per_car*1, 1)}} kW</div>
        </div>

        <b-tabs>
            <b-tab title="加減速度" @click="chart='accel'" active></b-tab>
            <b-tab title="所要時間" @click="chart='time'"></b-tab>
            <b-tab title="所要距離" @click="chart='dist'"></b-tab>
        </b-tabs>

        <chart-scatter :chart-data="chart_data[chart]" :options="chart_options[chart]" />
    </div>
</template>