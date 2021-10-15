<script>

export default {
    
    props: {
        color: null,
    },
}

</script>

<template>
    <div class="color-box" :style="{backgroundColor: color}">
    </div>
</template>

<style scoped>
    .color-box{
        display: inline;
        border: solid 2px black;
        padding: 0rem 0.3em;
        margin: 0rem 0.2em;
        line-height: 1em;
    }
</style>