<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPencil, BIconPlus } from 'bootstrap-vue'

    export default {

        props: {
            groupId: null,
            itemId: null,
            isNew: Boolean,
            isCopy: Boolean,
        },
        components: { BIcon, BIconPencil, BIconPlus },

        data() {
            return {
                editing: {
                    id: null, group_id: null,
                    name_chi: null, name_eng: null, remarks: null,
                    motor_ratio: null, motor_rated_kw: null, motor_overclock_ratio: null,
                    crush_capacity: null, empty_mass_avg_t: null, max_accel_kph_s: null,
                    resistance_loss_per_100kph: null, resistance_loss_per_100kph_q: null,
                    const_power_accel_ratio: null, max_speed_kph: null,
                    max_decel_kph_s: null, min_decel_kph_s: null, const_decel_max_kph: null,
                    depart_additional_time_s: null,
                },
                numeric_fields: [
                    "motor_ratio", "motor_rated_kw", "motor_overclock_ratio",
                    "crush_capacity", "empty_mass_avg_t", "max_accel_kph_s",
                    "resistance_loss_per_100kph", "resistance_loss_per_100kph_q",
                    "const_power_accel_ratio", "max_speed_kph",
                    "max_decel_kph_s", "min_decel_kph_s", "const_decel_max_kph",
                    "depart_additional_time_s",
                ],
                editing_failed: false,
            }
        },

        async mounted(){
            //Fill in Data
            if (this.isNew){
                this.editing.group_id = this.groupId;
            }else{
                var response = await $.callAPI(axios, "GET", "items/vehicle_performance_items/"+encodeURI(this.itemId), {
                });
                if (response.http_status != 200) return false;
                for (var i in this.editing){
                    this.editing[i] = response.data[i];
                }
            }
            //Remove zeros of numbers
            for (var i in this.numeric_fields){
                this.editing[this.numeric_fields[i]] = this.editing[this.numeric_fields[i]] * 1;
            }
        },

        methods: {
            getAcceleration(speed_kph){
                var accel = this.editing.max_accel_kph_s * 1;
                if (speed_kph > this.const_accel_max_kph){
                    accel *= this.const_accel_max_kph / speed_kph;
                }
                if (speed_kph > this.const_power_max_kph){
                    accel *= this.const_power_max_kph / speed_kph;
                }
                accel -= (speed_kph / 100) * this.editing.resistance_loss_per_100kph;
                accel -= (speed_kph * speed_kph / 10000) * this.editing.resistance_loss_per_100kph_q;
                return accel;
            },
            getDeceleration(speed_kph){
                var decel = this.editing.max_decel_kph_s;
                var cd_max = this.editing.const_decel_max_kph;
                var v_max = this.editing.max_speed_kph;
                var decel_max = this.editing.max_decel_kph_s;
                var decel_min = this.editing.min_decel_kph_s;
                if (speed_kph > cd_max){
                    decel -= (speed_kph - cd_max) / (v_max - cd_max) * (decel_max - decel_min);
                }
                return decel;
            },
            async submit(){
                var id = this.editing.id;
                var data = JSON.parse(JSON.stringify(this.editing));
                data.calc_results_by_kph = this.calc_results_by_kph;
                data.calc_results_other = this.calc_results_other;
                data.has_calc_results = (this.calc_results_by_kph != null);
                //Call API
                if (this.isNew || this.isCopy){
                    //Submit New
                    var response = await $.callAPI(axios, "POST", "items/vehicle_performance_items", data);
                }else{
                    //Submit Edit
                    var url = "items/vehicle_performance_items/"+encodeURI(id);
                    var response = await $.callAPI(axios, "PATCH", url, data);
                }
                if (response.http_status >= 400){
                    //Failed
                    this.editing_failed = true;
                }else{
                    //Success
                    this.$emit('submit', this.editing);
                }
            },
            //Display Digits
            d(value, digits){
                if (typeof value !== 'number') return null;
                return value.toFixed(digits);
            },
        },

        computed: {
            crush_mass_t(){
                return this.editing.empty_mass_avg_t * 1 + 0.075 * this.editing.crush_capacity;
            },
            power_rated_per_car(){
                return this.editing.motor_rated_kw * 4 * this.editing.motor_ratio / 100;
            },
            const_accel_max_kph(){
                return this.power_rated_per_car * this.editing.motor_overclock_ratio
                / (this.crush_mass_t * this.editing.max_accel_kph_s / 3.6) * 3.6;
            },
            const_power_max_kph(){
                return this.const_accel_max_kph * this.editing.const_power_accel_ratio;
            },
            //Calculation results other
            calc_results_other(){
                return {
                    crush_mass_t: this.crush_mass_t,
                    power_rated_per_car: this.power_rated_per_car,
                    const_accel_max_kph: this.const_accel_max_kph,
                    const_power_max_kph: this.const_power_max_kph,
                };
            },
            //Calculation results by speed
            calc_results_by_kph(){
                var $e = this.editing;
                //Check if all numeric fields are not NaN
                for (var i in this.numeric_fields){
                    if (isNaN($e[this.numeric_fields[i]])) return [];
                }
                //Prepare array and prepare v=0 data
                var result = [{
                    accel: $e.max_accel_kph_s*1, accel_time: 0, accel_dist: 0, accel_tdiff: 0,
                    decel: $e.max_decel_kph_s*1, decel_time: 0, decel_dist: 0, decel_tdiff: 0,
                    total_time: 0, total_dist: 0,
                    equiv_accel: 2 / (1/$e.max_accel_kph_s + 1/$e.max_decel_kph_s),
                }];
                //For each kph
                for (var v = 1; v <= $e.max_speed_kph; v++){
                    var accel = this.getAcceleration(v);
                    var decel = this.getDeceleration(v);
                    var accel_time = 2 / (accel*1 + result[v-1].accel*1);
                    var decel_time = 2 / (decel*1 + result[v-1].decel*1);
                    var accel_dist = (v - 0.5) / 3.6 * accel_time;
                    var decel_dist = (v - 0.5) / 3.6 * decel_time;
                    var accel_time_cum = result[v-1].accel_time + accel_time;
                    var decel_time_cum = result[v-1].decel_time + decel_time;
                    var accel_dist_cum = result[v-1].accel_dist + accel_dist;
                    var decel_dist_cum = result[v-1].decel_dist + decel_dist;
                    var accel_tdiff = accel_time_cum - (accel_dist_cum / v * 3.6);
                    var decel_tdiff = decel_time_cum - (decel_dist_cum / v * 3.6);
                    result.push({
                        accel: accel, accel_time: accel_time_cum, accel_dist: accel_dist_cum, accel_tdiff: accel_tdiff,
                        decel: decel, decel_time: decel_time_cum, decel_dist: decel_dist_cum, decel_tdiff: decel_tdiff,
                        total_time: accel_tdiff + decel_tdiff,
                        total_dist: accel_dist_cum + decel_dist_cum,
                        equiv_accel: v / (accel_tdiff + decel_tdiff),
                    });
                }
                //Round off values
                for (var i in result){
                    result[i].accel = Math.round(result[i].accel * 1000) / 1000;
                    result[i].decel = Math.round(result[i].decel * 1000) / 1000;
                    result[i].accel_time = Math.round(result[i].accel_time * 1000) / 1000;
                    result[i].decel_time = Math.round(result[i].decel_time * 1000) / 1000;
                    result[i].accel_dist = Math.round(result[i].accel_dist * 100) / 100;
                    result[i].decel_dist = Math.round(result[i].decel_dist * 100) / 100;
                    result[i].accel_tdiff = Math.round(result[i].accel_tdiff * 1000) / 1000;
                    result[i].decel_tdiff = Math.round(result[i].decel_tdiff * 1000) / 1000;
                    result[i].total_time = Math.round(result[i].total_time * 1000) / 1000;
                    result[i].total_dist = Math.round(result[i].total_dist * 100) / 100;
                    result[i].equiv_accel = Math.round(result[i].equiv_accel * 1000) / 1000;
                }
                //Return array
                return result;
            },
            //Display Speed Steps
            displaySpeedSteps(){
                if (isNaN(this.editing.max_speed_kph)) return [];
                if (this.editing.max_speed_kph >= 1000) return [];
                var arr = [0];
                for (var i = 5; i < this.editing.max_speed_kph; i+= 5){
                    arr.push(i);
                }
                arr.push(this.editing.max_speed_kph);
                return arr;
            },
        },

    }

</script>

<template>
    <div>
        <!--------------------------------------------------------------------->
        <h5>基本資料</h5>
        <div class="row">
            <div class="col-sm-4 col-lg-2">ID</div>
            <div class="col-sm-8 col-lg-4">
                <b-form-input type="text" v-model="editing.id" :disabled="!isNew && !isCopy" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-4 col-lg-2">組別</div>
            <div class="col-sm-8 col-lg-4">
                <select-vehicle-performance-group v-model="editing.group_id" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-lg-2">名稱</div>
            <div class="col-sm-12 col-lg-10">
                <b-form-input type="text" v-model="editing.name_chi" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-lg-2">備註</div>
            <div class="col-sm-12 col-lg-10">
                <b-form-textarea type="text" v-model="editing.remarks" size="sm" rows="5"
                @focus="editing_failed = false" />
            </div>
        </div>
        <hr/>

        <!--------------------------------------------------------------------->
        <h5>性能資料</h5>
        <div class="row">
            <div class="col-sm-6 col-xl-3">動力比例 (%)</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.motor_ratio" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-secondary" style="font-size: 80%">
                動力以每個車輛有4軸計算。例子：如MT比為「4M6T」，請輸入「40」。
            </div>
            <div class="col-sm-6 col-xl-3">電動機定格出力 (kW)</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.motor_rated_kw" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-secondary" style="font-size: 80%">
                1hp ~= 0.746kW，1ps ~= 0.735kW。
            </div>
            <div class="col-sm-6 col-xl-3">電動機超頻率</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.motor_overclock_ratio" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-secondary" style="font-size: 80%">
                如短時間最高輸出比定格高50%，請輸入「1.5」。
            </div>
            <div class="col-sm-6 col-xl-3">滿員時載客量</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.crush_capacity" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-secondary" style="font-size: 80%">
                每人以平均75kg計算，通常以定員2倍計算。
            </div>
            <div class="col-sm-6 col-xl-3">平均每輛淨重 (t)</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.empty_mass_avg_t" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-info" style="font-size: 80%">
                <strong>滿員時重量為 {{crush_mass_t}} t。</strong>
            </div>
            <div class="col-sm-6 col-xl-3">最高速度 (km/h)</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.max_speed_kph" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-secondary" style="font-size: 80%">
            </div>
            <div class="col-sm-6 col-xl-3">起動加速度 (km/h/s)</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.max_accel_kph_s" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-info" style="font-size: 80%">
                <strong>滿員時定加速度上限為 {{const_accel_max_kph.toFixed(1)}} km/h。</strong>
            </div>
            <div class="col-sm-6 col-xl-3">100km/h時加速度損失 (線性)</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.resistance_loss_per_100kph" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-secondary" style="font-size: 80%">
                單位為km/h/s，於100km/h時因阻力而損失的加速度。線性關係，即50km/h時的損失為此值的50%。
            </div>
            <div class="col-sm-6 col-xl-3">100km/h時加速度損失 (平方)</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.resistance_loss_per_100kph_q" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-secondary" style="font-size: 80%">
                單位為km/h/s，於100km/h時因阻力而損失的加速度。平方關係，即50km/h時的損失為此值的25%。
            </div>
            <div class="col-sm-6 col-xl-3">定出力/定加速度上限比例</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.const_power_accel_ratio" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-info" style="font-size: 80%">
                <strong>滿員時定出力上限為 {{const_power_max_kph.toFixed(1)}} km/h。</strong>
            </div>
            <div class="col-sm-6 col-xl-3">最高減速度 (km/h/s)</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.max_decel_kph_s" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-secondary" style="font-size: 80%">
                定減速度範圍時的減速度，以營業時的減速度計算。
            </div>
            <div class="col-sm-6 col-xl-3">最高速度時的減速度 (km/h/s)</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.min_decel_kph_s" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-secondary" style="font-size: 80%">
            </div>
            <div class="col-sm-6 col-xl-3">定減速度上限 (km/h)</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.const_decel_max_kph" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-secondary" style="font-size: 80%">
                由最高速度至此速度之間，減速度相對速度線性下降。
            </div>
            <div class="col-sm-6 col-xl-3">關門至開車時間 (s)</div>
            <div class="col-sm-6 col-xl-3">
                <b-form-input type="text" v-model="editing.depart_additional_time_s" @focus="editing_failed = false" />
            </div>
            <div class="col-sm-12 col-xl-6 text-secondary" style="font-size: 80%">
                關門至開車之間的所要時間。
            </div>
        </div>
        <hr/>
        
        <!--------------------------------------------------------------------->
        <div class="text-center">
            <div class="text-danger" v-if="editing_failed">提交失敗</div>
        </div>
        <b-button variant="primary" block class="mt-2" @click="submit">提交</b-button>
        <hr/>

        <!--------------------------------------------------------------------->
        <h5>計算結果</h5>
        <div class="mb-2">不計算關門至開車之間的時間。</div>

        <div class="table-responsive">
            <table class="table my-table" style="font-size: 0.8rem;">
                <thead class="thead-light">
                    <tr>
                        <th>速度<br/>v</th>
                        <th>加速度<br/>a</th>
                        <th>所要時間<br/>t<sub>a</sub></th>
                        <th>移動距離<br/>s<sub>a</sub></th>
                        <th>比定速額外<br/>t'<sub>a</sub> = t<sub>a</sub> - s<sub>a</sub>/v</th>
                        <th>速度<br/>v</th>
                        <th>減速度<br/>d</th>
                        <th>所要時間<br/>t<sub>d</sub></th>
                        <th>移動距離<br/>s<sub>d</sub></th>
                        <th>比定速額外<br/>t'<sub>d</sub> = t<sub>d</sub> - s<sub>d</sub></th>
                        <th>速度<br/>v</th>
                        <th>總移動距離<br/>S = s<sub>a</sub> + s<sub>d</sub></th>
                        <th>合計額外<br/>T = t'<sub>a</sub> + t'<sub>d</sub></th>
                        <th>等效加減速<br/>v/T</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="v in displaySpeedSteps" :key="v">
                        <template v-if="calc_results_by_kph[v]">
                            <th style="background-color: #eee;">{{v}} km/h</th>
                            <td style="background-color: #efe;">
                                {{d(calc_results_by_kph[v].accel, 2)}} km/h/s
                            </td>
                            <td style="background-color: #efe;">
                                {{d(calc_results_by_kph[v].accel_time, 2)}} s
                            </td>
                            <td style="background-color: #efe;">
                                {{d(calc_results_by_kph[v].accel_dist, 1)}} m
                            </td>
                            <td style="background-color: #efe;">
                                {{d(calc_results_by_kph[v].accel_tdiff, 2)}} s
                            </td>
                            <th style="background-color: #eee;">{{v}} km/h</th>
                            <td style="background-color: #fee;">
                                {{d(calc_results_by_kph[v].decel, 2)}} km/h/s
                            </td>
                            <td style="background-color: #fee;">
                                {{d(calc_results_by_kph[v].decel_time, 2)}} s
                            </td>
                            <td style="background-color: #fee;">
                                {{d(calc_results_by_kph[v].decel_dist, 1)}} m
                            </td>
                            <td style="background-color: #fee;">
                                {{d(calc_results_by_kph[v].decel_tdiff, 2)}} s
                            </td>
                            <th style="background-color: #eee;">{{v}} km/h</th>
                            <td style="background-color: #eef;">
                                {{d(calc_results_by_kph[v].total_dist, 1)}} m
                            </td>
                            <td style="background-color: #eef;">
                                {{d(calc_results_by_kph[v].total_time, 2)}} s
                            </td>
                            <td style="background-color: #eef;">
                                {{d(calc_results_by_kph[v].equiv_accel, 2)}} km/h/s
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
        <hr/>
        
        <!--------------------------------------------------------------------->
        <div class="text-center">
            <div class="text-danger" v-if="editing_failed">提交失敗</div>
        </div>
        <b-button variant="primary" block class="mt-2" @click="submit">提交</b-button>
            
        <!--------------------------------------------------------------------->
    </div>
</template>