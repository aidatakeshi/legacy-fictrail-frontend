<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    import { BIcon, BIconPencil, BIconPlus, BIconCaretDownFill } from 'bootstrap-vue'

    export default {
        layout: "dashboard",
        components: { BIcon, BIconPencil, BIconPlus, BIconCaretDownFill },

        data() {
            return {
                data: {},
            };
        },

        async mounted(){

        },

        methods: {
            async save(){

            },
        },

    }

</script>

<template>
    <div>

        <h1>HR票價</h1>

        <b-tabs content-class="mt-3">
            <!------------------------------------------------------------------------------------>
            <b-tab title="基本車票">

                <h2>基本車票票價 <small>（票價記號：T）</small></h2>

                <p><strong>里數級別設定：</strong></p>

                <h3>標準票價</h3>

                <h3>特定票價區域內之票價</h3>

                <h3>特定路線區間附加費</h3>

            </b-tab>
            <!------------------------------------------------------------------------------------>
            <b-tab title="近郊/急行">

                <h2>近郊頭等附加費<small>（票價記號：P）</small></h2>

                <h2>急行對號座附加費<small>（票價記號：X）</small></h2>
                

            </b-tab>
            <!------------------------------------------------------------------------------------>
            <b-tab title="特急/新幹線">

                <h2>特急/新幹線附加費<small>（票價記號：E）</small></h2>

                <h2>特急/新幹線頭等附加費<small>（票價記號：F）</small></h2>

                <h2>特急/新幹線商務座附加費<small>（票價記號：B）</small></h2>
                

            </b-tab>
            <!------------------------------------------------------------------------------------>
            <b-tab title="特別列車">

                <h2>特別列車附加費<small>（票價記號：S）</small></h2>

                <h2>包廂附加費<small>（票價記號：R）</small></h2>
                

            </b-tab>
            <!------------------------------------------------------------------------------------>
        </b-tabs>
    </div>
</template>