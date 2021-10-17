<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {

        data() {
            return {
                user: null,
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
                var response = await $.callAPI(axios, "POST", "login", {
                    user: this.user,
                    password: this.password,
                }, false);
                if (response.http_status >= 400){
                    this.wrong_credentials = true;
                }else{
                    var bearer_token = response.bearer_token;
                    $.saveToken(bearer_token);
                    this.$router.push('/main');
                }
            },
        },

    }

</script>

<template>
    <div class="d-flex w-100 justify-content-center align-items-center" style="height: 100vh">
        <b-card header="Login" style="width: 20rem; max-width: 90vw;">

            <label for="user">User</label>
            <input type="user" class="form-control" v-model="user" id="user" @focus="wrong_credentials=false">

            <label for="password">Password</label>
            <input type="password" class="form-control" v-model="password" id="password" @focus="wrong_credentials=false">

            <div class="text-danger" v-if="wrong_credentials">Wrong credentials</div>

            <b-button class="mt-2" variant="primary" block @click="login()">Login</b-button>

        </b-card>
    </div>
</template>