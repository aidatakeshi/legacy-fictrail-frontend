<script>
import { Scatter } from 'vue-chartjs'

export default {
    extends: Scatter,
    props: {
        chartData: { 
            type: Object,
            default: () => {}
        },
        options: { 
            type: Object,
            default: () => {}
        },
    },
    data: () => ({}),
    watch: {
        chartData() {
            this.$data._chart.destroy();
            this.renderChart2();
        },
        options() {
            this.$data._chart.destroy();
            this.renderChart2();
        },
        deep: true,
    },
    computed: {
        options2(){
            var options = this.options || {};
            options.responsive = true;
            options.maintainAspectRatio = false;
            return options;
        },
    },
    mounted() {
        this.renderChart2();
    },
    methods: {
        renderChart2(){
            this.renderChart(this.chartData, this.options2);
        }
    }
}
</script>