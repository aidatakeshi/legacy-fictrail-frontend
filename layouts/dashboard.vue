<script>

    import axios from '~/plugins/axios'
    import dashboardMenu from '../components/dashboard-menu.vue';
    const $ = require('~/common.js');

    export default {
        components: { dashboardMenu },
        head: {
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' },
            ],
        },

    }

</script>

<template>
    <div>

        <dashboard-menu />

        <b-container class="mt-4">
            <Nuxt />
        </b-container>

    </div>
</template>