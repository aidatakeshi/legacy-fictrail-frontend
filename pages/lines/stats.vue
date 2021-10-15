<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon } from 'bootstrap-vue';

    export default {

        layout: "dashboard",
        components: { BIcon },

        data() {
            return {
                data_operators: {},
                data_line_types: {},
                //op: Operator; lt: Line Type
                data_mileages_by_op: {},
                data_mileages_by_op_lt: {},
                data_mileages_by_lt: {},
                data_mileages_total: 0,
            }
        },

        async mounted(){
            //Get Operators
            this.data_operators = await $.getItems(axios, "operators", {
                filter: { is_passenger_hr: true }, sort: 'id',
            });

            //Get Line Types
            this.data_line_types =await $.getItems(axios, "line_types", {
                fields: 'id,name_chi', sort: 'sort',
            });

            //Set 0
            for (var i in this.data_operators){
                this.data_mileages_by_op[this.data_operators[i].id] = 0;
                this.data_mileages_by_op_lt[this.data_operators[i].id] = {};
                for (var j in this.data_line_types){
                    this.data_mileages_by_op_lt[this.data_operators[i].id][this.data_line_types[j].id] = 0;
                }
            }
            for (var i in this.data_line_types){
                this.data_mileages_by_lt[this.data_line_types[i].id] = 0;
            }

            //Get Lines
            var operator_ids = [];
            for (var i in this.data_operators) operator_ids.push(this.data_operators[i].id);
            var lines = await $.getItems(axios, "lines", {
                fields: 'operator_id,line_type_id,length_km',
                filter: {'operator_id': {'_in': operator_ids}},
            });
            for (var i in lines){
                var operator_id = lines[i].operator_id;
                var line_type_id = lines[i].line_type_id;
                var length_km = lines[i].length_km ? (lines[i].length_km * 1) : 0;
                if (this.data_mileages_by_op?.[operator_id] !== undefined){
                    this.data_mileages_by_op[operator_id] += length_km;
                }
                if (this.data_mileages_by_lt?.[line_type_id] !== undefined){
                    this.data_mileages_by_lt[line_type_id] += length_km;
                }
                if (this.data_mileages_by_op_lt?.[operator_id]?.[line_type_id] !== undefined){
                    this.data_mileages_by_op_lt[operator_id][line_type_id] += length_km;
                }
                this.data_mileages_total += length_km;
            }
        },

        methods: {

        },

    }

</script>

<template>
    <div>

        <h1 class="mb-2">HR的路線統計</h1>

        <div class="table-responsive">
            <table class="table table-hover my-table">
                <thead class="thead-light">
                    <tr>
                        <th>路線類型</th>
                        <th v-for="operator in data_operators" :key="operator.id"
                        :style="{'background-color': operator.color, 'color': operator.color_text}">
                            {{operator.name_chi}}
                        </th>
                        <th>合計</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="line_type in data_line_types" :key="line_type.id">
                        <th>{{line_type.name_chi}}</th>
                        <td v-for="operator in data_operators" :key="operator.id">
                            <span v-if="!(data_mileages_by_op_lt[operator.id]||{})[line_type.id]">-</span>
                            <span v-else>
                                {{data_mileages_by_op_lt[operator.id][line_type.id].toFixed(1)}}<small> km</small>
                            </span>
                        </td>
                        <th>
                            {{(data_mileages_by_lt[line_type.id]||0).toFixed(1)}}<small> km</small>
                        </th>
                    </tr>
                </tbody>
                <thead class="thead-light">
                    <tr>
                        <th>合計</th>
                        <th v-for="operator in data_operators" :key="operator.id">
                            {{(data_mileages_by_op[operator.id]||0).toFixed(1)}}<small> km</small>
                        </th>
                        <th>
                            {{data_mileages_total.toFixed(1)}}<small> km</small>
                        </th>
                    </tr>
                </thead>
            </table>
        </div>
        
        <!------------------------------------------------------------------------------------->

    </div>
</template>