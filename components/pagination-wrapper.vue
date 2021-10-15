<script>

export default {
    
    props: {
        id: null,
        page: null,
        count: null,
        limit: null,
    },

    data() {
        return {
            page$: null,
        }
    },

    watch: {
        page(){
            this.page$ = this.page;
        },
    },

    mounted(){
        this.page$ = this.page;
    },

    methods: {
        pageClicked(event, page){
            this.$emit('page-clicked', this.id, page);
        },
        jumpToPage(){
            var page = parseInt(prompt("請輸入頁數："));
            if (isNaN(page) || page == null) return false;
            if (page < 1) page = 1;
            var pages = Math.ceil(this.count / this.limit);
            if (page > pages) page = pages;
            this.$emit('page-clicked', this.id, page);
        },
    },

}

</script>

<template>
    <div>

        <div class="d-flex justify-content-between align-items-center flex-wrap" v-if="count > 0">
            <div class="my-2" @click="jumpToPage()"><strong>共有{{count}}項結果：</strong></div>
            <b-pagination v-model="page$" :total-rows="count" :per-page="limit" v-if="count > limit"
                first-number last-number
                @page-click="pageClicked"
            ></b-pagination>
        </div>

        <slot v-if="count > 0" />

        <b-card class="text-center" v-else>沒有結果</b-card>

        <div class="d-flex justify-content-end" v-if="count > limit">
            <b-pagination v-model="page$" :total-rows="count" :per-page="limit"
            first-number last-number @page-click="pageClicked">
            </b-pagination>
        </div>

    </div>
</template>