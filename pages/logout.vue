<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {

        data() {
            return {
            }
        },

        async mounted(){
            var rToken = $.getRefreshToken();
            var response = await $.callAPI(axios, "POST", "auth/logout", {
                refresh_token: rToken,
            }, false);
            $.clearToken();
            this.$router.push('/');
        },

    }

</script>

<template>
    <div>
    </div>
</template>