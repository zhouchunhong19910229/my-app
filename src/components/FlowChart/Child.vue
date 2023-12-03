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
        node: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {};
    },
    computed: {
        isHasBrcnchChilds() {
            const { children } = this.node;
            return children && children.length > 0;
        },
        isBranchNode() {
            const { nodeType } = this.node;
            return nodeType === '2';
        },
        isNormalNode() {
            const { nodeType } = this.node;
            return nodeType === '1';
        },
        isStartNode() {
            const { nodeType } = this.node;
            return nodeType === '3';
        },
        isEndNode() {
            const { nodeType } = this.node;
            return nodeType === '4';
        }
    },
    mounted() {},

    methods: {}
};
</script>
<template>
    <div class="flex column">
        <div v-if="isBranchNode" class="branch-wrap">
            <Chart :node="node" v-bind="$attrs" class="top" v-on="$listeners" />
            <div v-if="isHasBrcnchChilds" class="body">
                <Child
                    v-for="(item, index) in node.children"
                    :key="index"
                    :node="item"
                    v-bind="$attrs"
                    v-on="$listeners"
                />
            </div>
        </div>
        <div v-else>
            <Chart :node="node" v-bind="$attrs" v-on="$listeners" />
            <div v-if="isHasBrcnchChilds" class="flex">
                <Child
                    v-for="(node, index) in node.children"
                    :key="index"
                    :node="node"
                    v-bind="$attrs"
                    v-on="$listeners"
                ></Child>
            </div>
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
        // justify-content: space-around;
        & > div {
            margin: 0 20px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }
    }
}
</style>