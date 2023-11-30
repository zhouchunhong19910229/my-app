
<script>
import Child from './Child.vue';
import Chart from './Chart.vue';
import BranchNode from './Branch.vue';
export default {
    name: 'BranchNode',
    components: {
        Child,
        Chart,
        BranchNode
    },
    props: {
        node: {
            type: Object,
            default: () => {}
        }
    },
    computed: {
        isBranchNode() {
            const { nodeType } = this.data;
            return nodeType === '2';
        },
        isNormalNode() {
            const { nodeType } = this.data;
            return nodeType === '1';
        }
    },
    data() {
        return {};
    },

    mounted() {},

    methods: {}
};
</script>
<template>
    <div class="branch-wrap">
        <div class="top"><Chart :node="node" v-bind="$attrs" v-on="$listeners" /></div>
        <div class="body">
            <div v-for="(item, index) in node.children" :key="index">
                <Chart v-if="isNormalNode" :node="item" v-bind="$attrs" v-on="$listeners" />
                <BranchNode v-if="isBranchNode" :node="item" v-bind="$attrs" v-on="$listeners" />
            </div>
        </div>
    </div>
</template>
<style lang="less" scoped>
.branch-wrap {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .top {
        display: flex;
        justify-content: space-around;
    }
    .body {
        display: flex;
        justify-content: space-around;
    }
}
</style>