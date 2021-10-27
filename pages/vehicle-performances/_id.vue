<script>

    import axios from '~/plugins/axios'
    const $ = require('~/common.js');

    export default {

        layout: "dashboard",

        data() {
            return {
                title: null,
                data_groups: [],
                data: [],
                viewing_item_id: null,
                trigger: 0,
            }
        },

        async mounted(){
            await this.loadData();
        },

        methods: {
            async loadData(){
                //Groups
                var response = await $.callAPI(axios, 'GET', `items/vehicle_performance_group`);
                if (response.http_response >= 400) return false;
                this.data_groups = response.data;
                for (var i in this.data_groups){
                    if (this.data_groups[i].id == this.$route.params.id){
                        this.title = this.data_groups[i].name_chi;
                    }
                }
                //Items
                var response = await $.callAPI(axios, 'GET', `items/vehicle_performance_item`, {
                    group_id: this.$route.params.id,
                });
                if (response.http_response >= 400) return false;
                this.data = response.data;
                this.trigger++;
            },
            showEdit(id){
                this.$refs.edit_modal.showEdit(id, false);
            },
            showNew(data){
                this.$refs.edit_modal.showNew(data);
            },
            viewGraph(id){
                this.viewing_item_id = id;
                this.$refs.calc_result_modal.show();
            },
            duplicate(id){
                this.$refs.edit_modal.showEdit(id, true);
            },
        },

    }

</script>

<template>
    <div class="my-4">
        <h1>{{title}}</h1>

        <!-- Breadcrumb -->
        <div class="mt-2">
            <b-breadcrumb>
                <b-breadcrumb-item to="/vehicle-performances">車輛性能設定</b-breadcrumb-item>
                <b-breadcrumb-item active>{{title}}</b-breadcrumb-item>
            </b-breadcrumb>
        </div>

        <!-- Create New -->
        <button-new @click="showNew({group_id: $route.params.id})" />

        <!-- Content -->
        <div class="my-2">
            <list-item type="vehicle_performance_item" :data="data" :trigger="trigger"
                @change="loadData" @edit="showEdit"
                @view-graph="viewGraph" @duplicate="duplicate"
            />
        </div>

        <!-- Edit Modal -->
        <edit-vehicle-performance-item ref="edit_modal" @change="loadData" />

        <!-- View Modal -->
        <b-modal ref="calc_result_modal" centered scrollable hide-footer size="xl"
        title="計算結果" header-bg-variant="dark" header-text-variant="light" >
            <view-vehicle-performance-item :item-id="viewing_item_id" />
        </b-modal>

        <!-- Create New -->
        <button-new @click="showNew({group_id: $route.params.id})" />

        <!-- Navigation -->
        <div class="mt-2">
            <b-breadcrumb>
                <b-breadcrumb-item v-for="group in data_groups" :key="group.id"
                :to="'/vehicle-performances/'+encodeURIComponent(group.id)"
                :active="group.id == $route.params.id">
                    {{group.name_chi}}
                </b-breadcrumb-item>
            </b-breadcrumb>
        </div>

    </div>
</template>