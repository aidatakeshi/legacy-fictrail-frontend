<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {
        layout: "dashboard",

        data() {
            return {
                selectItem: {
                    operatorType: null,
                    operator: null,
                    operatorOfType: null,
                    prefectureArea: null,
                    prefecture: null,
                    prefectureOfArea: null,
                    lineType: null,
                    lineGroup: null,
                    line: null,
                    lineOfOperator: null,
                    lineOfType: null,
                    lineOfGroup: null,
                    trainType: null,
                    trainName: null,
                    trainNameOfType: null,
                    vehiclePerformanceGroup: null,
                    vehiclePerformanceItem: null,
                    vehiclePerformanceItemOfGroup: null,
                    schdraftCategory: null,
                    schdraftGroup: null,
                    schdraftGroupOfCategory: null,
                    schdraftTemplate: null,
                    schdraftTemplateOfGroup: null,
                },
                selectItem2: {
                    operatorType: null,
                    operator: null,
                },
                selectStationOfLine: null,
                selectLineOfStation: null,
            }
        },

        methods: {
        },

        computed: {

        },

    }

</script>

<template>
    <div class="my-4">

        <h1>Test Components 1</h1>

        <h2>select-item</h2>

        <b-card>

            <div class="row">
                <div class="col-sm-6">
                    <strong>type="operator_type"</strong>
                    <select-item type="operator_type" v-model="selectItem.operatorType" />
                    Selected: {{selectItem.operatorType}}
                </div>
                <div class="col-sm-6">
                    <strong>type="operator"</strong>
                    <select-item type="operator" v-model="selectItem.operator" />
                    Selected: {{selectItem.operator}}
                </div>
                <div class="col-sm-6">
                    <strong>type="operator of type" filter="HR"</strong>
                    <select-item type="operator of type" filter="HR" v-model="selectItem.operatorOfType" />
                    Selected: {{selectItem.operatorOfType}}
                </div>

                <div class="col-sm-6">
                    <strong>type="prefecture_area"</strong>
                    <select-item type="prefecture_area" v-model="selectItem.prefectureArea" />
                    Selected: {{selectItem.prefectureArea}}
                </div>
                <div class="col-sm-6">
                    <strong>type="prefecture"</strong>
                    <select-item type="prefecture" v-model="selectItem.prefecture" />
                    Selected: {{selectItem.prefecture}}
                </div>
                <div class="col-sm-6">
                    <strong>type="prefecture of area" filter="ne"</strong>
                    <select-item type="prefecture of area" filter="ne" v-model="selectItem.prefectureOfArea" />
                    Selected: {{selectItem.prefectureOfArea}}
                </div>

                <div class="col-sm-6">
                    <strong>type="line_type"</strong>
                    <select-item type="line_type" v-model="selectItem.lineType" />
                    Selected: {{selectItem.lineType}}
                </div>
                <div class="col-sm-6">
                    <strong>type="line_group"</strong>
                    <select-item type="line_group" v-model="selectItem.lineGroup" />
                    Selected: {{selectItem.lineGroup}}
                </div>
                <div class="col-sm-6">
                    <strong>type="line"</strong>
                    <select-item type="line" v-model="selectItem.line" />
                    Selected: {{selectItem.line}}
                </div>
                <div class="col-sm-6">
                    <strong>type="line of group" filter="hr-ihsr"</strong>
                    <select-item type="line of group" filter="hr-ihsr" v-model="selectItem.lineOfGroup" />
                    Selected: {{selectItem.lineOfGroup}}
                </div>
                <div class="col-sm-6">
                    <strong>type="line of type" filter="HSR"</strong>
                    <select-item type="line of type" filter="HSR" v-model="selectItem.lineOfType" />
                    Selected: {{selectItem.lineOfType}}
                </div>
                <div class="col-sm-6">
                    <strong>type="line of operator" filter="hr-n"</strong>
                    <select-item type="line of operator" filter="hr-n" v-model="selectItem.lineOfOperator" />
                    Selected: {{selectItem.lineOfOperator}}
                </div>

                <div class="col-sm-6">
                    <strong>type="train_type"</strong>
                    <select-item type="train_type" v-model="selectItem.trainType" />
                    Selected: {{selectItem.trainType}}
                </div>
                <div class="col-sm-6">
                    <strong>type="train_name"</strong>
                    <select-item type="train_name" v-model="selectItem.trainName" />
                    Selected: {{selectItem.trainName}}
                </div>
                <div class="col-sm-6">
                    <strong>type="train_name of type" filter="HR-HSR"</strong>
                    <select-item type="train_name of type" filter="HR-HSR" v-model="selectItem.trainNameOfType" />
                    Selected: {{selectItem.trainNameOfType}}
                </div>
                
                <div class="col-sm-6">
                    <strong>type="vehicle_performance_group"</strong>
                    <select-item type="vehicle_performance_group" v-model="selectItem.vehiclePerformanceGroup" />
                    Selected: {{selectItem.vehiclePerformanceGroup}}
                </div>
                <div class="col-sm-6">
                    <strong>type="vehicle_performance_item"</strong>
                    <select-item type="vehicle_performance_item" v-model="selectItem.vehiclePerformanceItem" />
                    Selected: {{selectItem.vehiclePerformanceItem}}
                </div>
                <div class="col-sm-6">
                    <strong>type="vehicle_performance_item of group" filter="hr-hsr"</strong>
                    <select-item type="vehicle_performance_item of group" filter="hr-hsr" v-model="selectItem.vehiclePerformanceItemOfGroup" />
                    Selected: {{selectItem.vehiclePerformanceItemOfGroup}}
                </div>

                <div class="col-sm-6">
                    <strong>type="schdraft_category"</strong>
                    <select-item type="schdraft_category" v-model="selectItem.schdraftCategory" />
                    Selected: {{selectItem.schdraftCategory}}
                </div>
                <div class="col-sm-6">
                    <strong>type="schdraft_group"</strong>
                    <select-item type="schdraft_group" v-model="selectItem.schdraftGroup" />
                    Selected: {{selectItem.schdraftGroup}}
                </div>
                <div class="col-sm-6">
                    <strong>type="schdraft_group of category" filter="hsr-a"</strong>
                    <select-item type="schdraft_group of category" filter="hsr-a" v-model="selectItem.schdraftGroupOfCategory" />
                    Selected: {{selectItem.schdraftGroupOfCategory}}
                </div>
                <div class="col-sm-6">
                    <strong>type="schdraft_template"</strong>
                    <select-item type="schdraft_template" v-model="selectItem.schdraftTemplate" />
                    Selected: {{selectItem.schdraftTemplate}}
                </div>
                <div class="col-sm-6">
                    <strong>type="schdraft_template of group" filter="hsr-a-w1"</strong>
                    <select-item type="schdraft_template of group" filter="hsr-a-w1" v-model="selectItem.schdraftTemplateOfGroup" />
                    Selected: {{selectItem.schdraftTemplateOfGroup}}
                </div>
            </div>

            <hr/>

            <h3>Multiple Selecters</h3>
            <div class="row">
                <div class="col-sm-6">
                    <strong>Operator Type</strong>
                    <select-item type="operator_type" v-model="selectItem2.operatorType" nullable />
                    Selected: {{selectItem2.operatorType}}
                </div>
                <div class="col-sm-6">
                    <strong>Operator</strong>
                    <select-item type="operator of type" v-model="selectItem2.operator" nullable
                    :filter="selectItem2.operatorType" />
                    Selected: {{selectItem2.operator}}
                </div>
            </div>

        </b-card>

        <h2>select-station-of-line</h2>

        <b-card>
            <div class="row">
                <div class="col-sm-6">
                    <select-station-of-line v-model="selectStationOfLine"
                    line-id="008e934b-110d-46a0-ad65-196cbc0acf0b" />
                    Selected: {{selectStationOfLine}}
                </div>
            </div>
        </b-card>

        <h2>select-line-of-station</h2>

        <b-card>
            <div class="row">
                <div class="col-sm-6">
                    <select-line-of-station v-model="selectLineOfStation"
                    station-id="369864db-f29a-40c8-84dd-c8eca786c66b" />
                    Selected: {{selectLineOfStation}}
                </div>
            </div>
        </b-card>

    </div>
</template>