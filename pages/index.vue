<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {

        data() {
            return {
                email: null,
                password: null,
                wrong_credentials: false,
            }
        },

        mounted(){
            //If already logged in -> push to /main
            if ($.getToken()){
                this.$router.push('/main');
            }
        },

        methods: {
            async login(){
                var response = await $.callAPI(axios, "POST", "auth/login", {
                    email: this.email,
                    password: this.password,
                }, false);
                if (response.http_status >= 400){
                    this.wrong_credentials = true;
                }else{
                    var access_token = response.data.access_token;
                    var refresh_token = response.data.refresh_token;
                    $.saveToken(access_token);
                    $.saveRefreshToken(refresh_token);
                    this.$router.push('/main');
                }
            },
        },

    }

</script>

<template>
    <div class="d-flex w-100 justify-content-center align-items-center" style="height: 100vh">
        <b-card header="Login" style="width: 20rem; max-width: 90vw;">

            <label for="email">Email</label>
            <input type="email" class="form-control" v-model="email" id="email" @focus="wrong_credentials=false">

            <label for="password">Password</label>
            <input type="password" class="form-control" v-model="password" id="password" @focus="wrong_credentials=false">

            <div class="text-danger" v-if="wrong_credentials">Wrong credentials</div>

            <b-button class="mt-2" variant="primary" block @click="login()">Login</b-button>

        </b-card>
    </div>
</template>