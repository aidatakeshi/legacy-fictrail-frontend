<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {
        layout: "dashboard",

    }

</script>

<template>
    <div class="my-4">

        <h1>Test</h1>

        <ul>
            <li><nuxt-link to="/test/components-select">Components - Select</nuxt-link></li>
        </ul>

    </div>
</template>