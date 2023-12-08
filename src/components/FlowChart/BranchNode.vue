<script>
export default {
    name: 'BranchNode',
    props: {
        node: {
            type: Object,
            default: () => {}
        },
        isNodeInclude: Function,
        toBeDeletedOpt: Function,
        toBeAddedOpt: Function
    },
    data() {
        return {};
    },
    computed: {
        nodeLabel() {
            return this.node.label;
        }
    },
    mounted() {},

    methods: {}
};
</script>
<template>
    <div class="branch">
        <div class="diamond"></div>
        <span class="label">待维护</span>
        <div class="text">{{ nodeLabel }}</div>
    </div>
</template>
<style lang="less" scoped>
@theme_color: #1d70f5;
.branch {
    width: 64px;
    height: 64px;
    position: relative;
    .text {
        color: rgba(0, 0, 0, 0.4);
        position: absolute;
        z-index: 2;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .label {
        position: absolute;
        z-index: 5;
        display: flex;
        width: 100%;
        text-align: center;
        justify-content: center;
        background: red;
        color: #fff;
        border-radius: 5px;
        padding: 2px 0;
        top: 2px;
    }
    &.no_deal {
        background: #e34d59;
    }
    &.toBeAdded {
        background-color: #47c1b3;
    }
    &.toBeDeleted {
        background-color: #f6685d;
    }
    &.toBeRemoved {
        background-color: #fa9550;
    }
    .diamond {
        left: 50%;
        top: 50%;
        transform-origin: 0 0;
        border: 1px solid @theme_color;
        background: #fff;
        width: 44px;
        height: 44px;
        position: absolute;
        z-index: 1;
        box-sizing: border-box;
        transform: rotate(45deg) translate(-50%, -50%);
    }
}
</style>