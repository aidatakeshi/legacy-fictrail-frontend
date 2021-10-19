<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');
    const menu = require('~/config.menu.js');

    export default {

        layout: "dashboard",

        data() {
            return {
            }
        },

        methods: {
        },

        computed: {
            menu(){
                if (menu == null) return [];
                return menu.menu;
            },
        },

    }

</script>

<template>
    <div class="my-4">
        <div v-for="(item, i) in menu" :key="i">
            <nuxt-link :to="item.href" v-if="!item.sub">
                <div class="my-1 w-100 d-flex justify-content-center">
                    <b-button style="max-width: 20rem;" size="lg" block>{{item.text}}</b-button>
                </div>
            </nuxt-link>
            <template v-else>
                <nuxt-link v-for="(sub_item, j) in item.sub" :key="j" :to="sub_item.href">
                    <div class="my-1 w-100 d-flex justify-content-center">
                        <b-button style="max-width: 20rem;" size="lg" block>{{sub_item.text}}</b-button>
                    </div>
                </nuxt-link>
            </template>
        </div>
    </div>
</template>