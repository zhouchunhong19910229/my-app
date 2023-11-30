<script>
import Child from './Child.vue';
import Chart from './Chart.vue';
export default {
    name: 'Child',
    components: {
        Child,
        Chart
    },
    props: {
        data: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {};
    },
    computed: {
        isHasBrcnchChilds() {
            const { children } = this.data;
            return children && children.length > 0;
        }
    },
    mounted() {},

    methods: {}
};
</script>
<template>
    <div class="flex column">
        <Chart :node="data" v-bind="$attrs" v-on="$listeners" />
        <div v-if="isHasBrcnchChilds" class="flex">
            <Child
                v-for="(node, index) in data.children"
                :key="index"
                :data="node"
                v-bind="$attrs"
                v-on="$listeners"
            ></Child>
        </div>
    </div>
</template>
<style lang="less" scoped>
.flex {
    display: flex;
    justify-content: space-around;
}
.column {
    flex-direction: column;
}
</style>