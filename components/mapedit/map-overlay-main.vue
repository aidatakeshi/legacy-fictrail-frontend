<script>

import {
    BIcon, BIconPlus, BIconPen, BIconEye, BIconEyeSlash, BIconLock, BIconUnlock,
    BIconChevronUp, BIconChevronDown, BIconChevronLeft, BIconChevronRight, BIconArrowRepeat,
} from 'bootstrap-vue'

export default {
    
    components: {
        BIcon, BIconPlus, BIconPen, BIconEye, BIconEyeSlash, BIconLock, BIconUnlock,
        BIconChevronUp, BIconChevronDown, BIconChevronLeft, BIconChevronRight, BIconArrowRepeat,
    },
    props: {
        dataLineTypes: Object,
        dataLines: Object,
        trigger: Number,
    },

    data() {
        return {
            operator_id_selected: null,
            headers_collapsed: {},
            linesFiltered: {}, //linesFiltered[type_id]
        };
    },

    watch: {
        trigger(){
            this.updatedLinesFiltered();
        },
    },

    mounted(){
        //Load LocalStorage
        this.headers_collapsed = JSON.parse(localStorage.getItem('map-linelist-headers') || '{}');
        this.operator_id_selected = localStorage.getItem('map-linelist-operator-id');
        if (this.operator_id_selected == '#') this.operator_id_selected = null;
        this.updatedLinesFiltered();
    },

    methods: {
        updatedLinesFiltered(){
            for (var type_id in this.dataLineTypes){
                this.linesFiltered[type_id] = this.getFilteredLines(type_id);
            }
            this.$forceUpdate();
        },
        getFilteredLines(type_id){
            var arr = [];
            for (var i in this.dataLineTypes[type_id].line_ids){
                var line_id = this.dataLineTypes[type_id].line_ids[i];
                var line = this.dataLines[line_id];
                if (line){
                    if (this.operator_id_selected == null || line.operator_id == this.operator_id_selected){
                        arr.push(line);
                    }
                }
            }
            return arr;
        },
        newStation(){
            this.$emit('new-station');
        },
        selectOperatorChanged(){
            localStorage.setItem('map-linelist-operator-id', this.operator_id_selected || '#');
            this.updatedLinesFiltered();
        },
        toggleHeaderCollapse(type_id){
            if (this.headers_collapsed[type_id]){
                delete this.headers_collapsed[type_id];
            }else{
                this.headers_collapsed[type_id] = true;
            }
            this.$forceUpdate();
            //Save LocalStorage
            localStorage.setItem('map-linelist-headers', JSON.stringify(this.headers_collapsed));
        },
        lineClickedInList(line_id){
            this.$emit('line-selected', line_id);
        },
    },

    computed: {

    },
}

</script>

<template>
    <div class="map-overlay">
        <div class="mb-2 text-right">
            <b-button variant="warning" @click="$emit('reload')">
                <b-icon-arrow-repeat />重新載入
            </b-button>
            <b-button variant="info" @click="newStation()">
                <b-icon-plus />新增車站
            </b-button>
        </div>
        <hr class="my-2" />
        <!----------------------------------->
        <h1>選擇路線</h1>

        <div class="mt-2">
            <div>選擇營運者：</div>
            <select-item type="operator" v-model="operator_id_selected" nullable @input="selectOperatorChanged()" />
        </div>

        <div class="map-line-list">
            <div class="mb-2 type" v-for="(type, type_id) in dataLineTypes" :key="type_id">
                <!-- Header -->
                <div class="header" :set="initialPrev = null">
                    <div class="content">
                        {{type.name_chi}}
                    </div>
                    <div class="buttons">
                        <b-button variant="outline-primary" v-if="headers_collapsed[type_id]"
                        @click="toggleHeaderCollapse(type_id)">
                            <b-icon-chevron-down />
                        </b-button><!---
                    ---><b-button variant="outline-primary" v-else
                        @click="toggleHeaderCollapse(type_id)">
                            <b-icon-chevron-up />
                        </b-button>
                    </div>
                </div>
                <!-- Body -->
                <div v-if="!headers_collapsed[type_id]">
                    <div v-for="(line, i) in linesFiltered[type_id]" :key="i"
                    :set="initial = line.name_eng.toUpperCase().substr(0, 1)">
                        <div class="initial" v-if="initial != initialPrev" :set="initialPrev = initial">
                            {{initial}}
                        </div>
                        <div class="line">
                            <div class="content" @click="lineClickedInList(line.id)">
                                <color-box :color="line.color" />
                                {{line.name_chi}}
                            </div>
                            <div class="buttons">
                            </div>
                        </div>
                    </div>
                </div>
                <!-------------------------------------------------------------------------------->
            </div>

        </div>
    </div>
</template>