<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');
    const menu = require('~/menu.js');

    import { BIcon, BIconCaretLeftFill, BIconCaretRightFill } from 'bootstrap-vue'

    export default {

        components: { BIcon, BIconCaretLeftFill, BIconCaretRightFill },
        
        head(){
            return {
                link: [
                    {rel: 'stylesheet', href: '/dashboard.css'},
                ],
            };
        },

        props: {
            floating: Boolean,
        },

        data() {
            return {
                displayed: false,
            }
        },

        async mounted(){
            //Verify Myself
            var response = await $.callAPI(axios, "GET", "users/me", {});
            if (response.http_status >= 400){
                //4xx error -> force out
                $.clearToken();
                return this.$router.push('/');
            }
            //Refresh token in intervals
            //this.refreshing = setInterval(this.refreshToken, 600000); //Every 10 minutes
            //this.refreshToken();
        },

        beforeDestroy(){
            clearInterval(this.refreshing);
        },

        methods: {
            async refreshToken(){
                var refresh_token = $.getRefreshToken();
                var response = await $.callAPI(axios, "POST", "auth/refresh", {
                    refresh_token: refresh_token,
                });
                if (response.data){
                    $.saveToken(response.data.access_token);
                    $.saveRefreshToken(response.data.refresh_token);
                }
            },
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
    <div>
        <!-- Overlay (Only for floating mode) -->
        <div class="navbar-overlay" v-if="floating && displayed" @click="displayed=false">
        </div>
        <!-- Nav Bar-->
        <b-navbar toggleable="lg" type="dark" variant="dark" class="w-100"
        v-if="!floating || displayed" :class="{'navbar-floating': floating}">
            <b-navbar-brand href="/main">
                <img src="/images/hr_logo.svg" style="height: 3rem; margin-top: -0.5rem; margin-bottom: -0.5rem;" />
            </b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav class="ml-auto">
                    <template v-for="(item, i) in menu">
                        <b-nav-item v-if="!item.sub" :key="i" :href="item.href">
                            {{item.text}}
                        </b-nav-item>
                        <b-nav-item-dropdown v-else :key="i" :href="item.href" :text="item.text">
                            <b-dropdown-item v-for="(sub_item, j) in item.sub" :key="j" :href="sub_item.href">
                                {{sub_item.text}}
                            </b-dropdown-item>
                        </b-nav-item-dropdown>
                    </template>

                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        <!-- Nav Toggler (Only for floating mode) -->
        <div class="navbar-toggle-floating" v-if="floating && !displayed">
            <button class="navbar-toggle-button" @click="displayed=true;">
                <img src="/images/hr_logo.svg" class="w-100" />
            </button>
        </div>
    </div>
</template>

<style scoped>
    .navbar-floating{
        position:fixed;
        top: 0;
        right: 0;
        z-index: 100;
        z-index: 999;
    }
    .navbar-toggle-floating{
        position:fixed;
        top: 0;
        left: calc(50% - 1rem);
        width: 2rem;
        padding: 0.2rem;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }
    @media only screen and (max-width: 800px) {
        .navbar-toggle-floating{
            left: 0;
        }
    }
    .navbar-toggle-button{
        background: none;
        border: none;
        color: white;
        margin: 0;
        padding: 0;
    }
    .navbar-overlay{
        background: rgba(0, 0, 0, 0.1);
        position:fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 996;
    }
</style>