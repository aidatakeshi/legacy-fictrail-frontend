<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import ColorBox from '@/components/color-box';

    export default {

        layout: "dashboard",

        components: {
            ColorBox,
        },

        data() {
            return {
                data: {},
                dataLoaded: false,
            }
        },

        async mounted(){
            var response = await $.callAPI(axios, 'GET', 'line-stats-hr');
            if (response.http_status >= 400) return false;
            this.data = response;
            this.dataLoaded = true;
        },

        methods: {
        },

    }

</script>

<template>
    <div class="my-4">

        <h1 class="mb-2">HR的路線統計</h1>

        <!-- Breadcrumb -->
        <div class="mt-2">
            <b-breadcrumb>
                <b-breadcrumb-item to="/lines">路線</b-breadcrumb-item>
                <b-breadcrumb-item to="/lines/groups">路線組合</b-breadcrumb-item>
                <b-breadcrumb-item to="/lines/types">路線類別</b-breadcrumb-item>
                <b-breadcrumb-item to="/lines/stats-hr" active>HR的路線統計</b-breadcrumb-item>
            </b-breadcrumb>
        </div>

        <!-- Table -->
        <div class="table-responsive" v-if="dataLoaded">
            <table class="table table-hover my-table">
                <thead class="thead-light">
                    <tr>
                        <th>路線類型</th>
                        <th v-for="(operator, o_id) in data.operators" :key="o_id">
                            <color-box :color="operator.color" />
                            {{operator.name_chi}}
                        </th>
                        <th>合計</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(line_type, l_id) in data.line_types">
                        <tr :key="l_id" v-if="data.mileage_by_line_type[l_id]">
                            <th style="background-color: rgba(0,0,0,0.03)">
                                {{line_type.name_chi}}
                            </th>
                            <td v-for="(operator, o_id) in data.operators" :key="o_id">
                                <span v-if="!data.mileage_by_line_type_operator[l_id][o_id]">-</span>
                                <span v-else>
                                    {{data.mileage_by_line_type_operator[l_id][o_id].toFixed(1)}}<small> km</small>
                                </span>
                            </td>
                            <th style="background-color: rgba(0,0,0,0.03)">
                                {{data.mileage_by_line_type[l_id].toFixed(1)}}<small> km</small>
                            </th>
                        </tr>
                    </template>
                </tbody>
                <thead class="thead-light">
                    <tr>
                        <th>合計</th>
                        <th v-for="(operator, o_id) in data.operators" :key="o_id">
                            {{data.mileage_by_operator[o_id].toFixed(1)}}<small> km</small>
                        </th>
                        <th>
                            {{data.mileage_total.toFixed(1)}}<small> km</small>
                        </th>
                    </tr>
                </thead>
            </table>
        </div>

        <div v-else class="text-center">
            <b-spinner />
        </div>

    </div>
</template>