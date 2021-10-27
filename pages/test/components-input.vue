<script>

    const $ = require('~/common.js');

    export default {
        layout: "dashboard",

        data() {
            return {
                numberSigned1: null,
                numberSigned2: null,
                minSec1: null,
                minSec2: null,
                time1: null,
                time2: null,
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

        <h1>Test Components</h1>

        <h2>input-number-signed</h2>

        <b-card>
            <div class="row">
                <div class="col-sm-6">
                    (default)
                    <input-number-signed v-model="numberSigned1" size="sm" />
                    {{numberSigned1}}
                </div>
                <div class="col-sm-6">
                    (decimals=2)
                    <input-number-signed v-model="numberSigned2" size="sm" :decimals="2" />
                    {{numberSigned2}}
                </div>
            </div>
        </b-card>

        <h2>input-min-sec</h2>

        <b-card>
            <div class="row">
                <div class="col-sm-6">
                    (default)
                    <input-min-sec v-model="minSec1" size="sm" />
                    {{minSec1}}
                </div>
                <div class="col-sm-6">
                    (signed)
                    <input-min-sec v-model="minSec2" size="sm" signed />
                    {{minSec2}}
                </div>
            </div>
        </b-card>

        <h2>input-time</h2>

        <b-card>
            <div class="row">
                <div class="col-sm-6">
                    <input-time v-model="time1" :next-value="time2" size="sm" />
                    {{time1}}
                </div>
                <div class="col-sm-6">
                    <input-time v-model="time2" :prev-value="time1" size="sm" />
                    {{time2}}
                </div>
                <div class="col-sm-6">
                    size="sm" bold center suffix="發"
                    <input-time v-model="time1" :next-value="time2"
                    size="sm" bold center suffix="發" />
                    {{time1}}
                </div>
                <div class="col-sm-6">
                    size="sm" italic center small suffix="↓"
                    <input-time v-model="time2" :prev-value="time1"
                    size="sm" italic center small suffix="↓" />
                    {{time2}}
                </div>
            </div>
        </b-card>

    </div>
</template>