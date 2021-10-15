<script>

    export default {
        
        props: {
            config: null,
            x: Number,
            y: Number,
            text: String,
            color: String,
            action: String,
        },

        data() {
            return {
                hovered: false,
            };
        },

        watch: {
        },

        async mounted(){
        },

        methods: {
            handleClicked(event){
                event.evt.preventDefault();
                this.$emit('click', this.action);
            },
        },

        computed: {
        },
    }

</script>

<template>
    <v-group :config="{x: x, y: y}">
        <v-rect :config="{
            x: config.line_edit_menu_button_gap,
            y: config.line_edit_menu_button_gap,
            width: config.line_edit_menu_button_width,
            height: config.line_edit_menu_button_height,
            fill: color ? color : config.line_edit_menu_button_default_background,
            stroke: color ? color : config.line_edit_menu_button_default_border_color,
            strokeWidth: config.line_edit_menu_button_border,
        }"
            @mouseenter="hovered = true" @mouseleave="hovered = false"
            @mousedown="handleClicked" @touchstart="handleClicked" @contextmenu="handleClicked"
        />
        <v-rect v-if="hovered" :config="{
            x: config.line_edit_menu_button_gap,
            y: config.line_edit_menu_button_gap,
            width: config.line_edit_menu_button_width,
            height: config.line_edit_menu_button_height,
            fill: 'black',
            opacity: color ? config.line_edit_menu_hover_alpha : config.line_edit_menu_hover_alpha2,
            listening: false,
        }" />
        <v-text :config="{
            x: config.line_edit_menu_button_gap,
            y: config.line_edit_menu_button_gap + config.line_edit_menu_button_text_yshift,
            width: config.line_edit_menu_button_width,
            height: config.line_edit_menu_button_height,
            align: 'center',
            fontSize: config.line_edit_menu_button_font_size,
            text: text,
            fill: color ? config.line_edit_menu_button_font_color : config.line_edit_menu_button_font_color2,
            listening: false,
        }" />
    </v-group>
</template>