<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {

        data() {
            return {
            }
        },

        async mounted(){
            var response = await $.callAPI(axios, "POST", "logout", false);
            $.clearToken();
            this.$router.push('/');
        },

    }

</script>

<template>
    <div>
    </div>
</template>