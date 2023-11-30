<script>
export default {
    name: 'FlowChartNode',
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
        return {
            current: {}
        };
    },
    computed: {
        isApp() {
            return this.node.type === 'appService';
        },
        isActive() {
            return this.nodeId === this.current.id;
        },
        nodeLabel() {
            return this.node.label;
        },
        nodeId() {
            return this.node.id;
        },
        nodeStat() {
            return this.node.dealStat;
        },
        //分支节点
        isBranchNode() {
            return this.node.nodeType === '2';
        },
        isStartNode() {
            return this.node.nodeType === '3';
        },
        isEndNode() {
            return this.node.nodeType === '4';
        }
    },
    mounted() {},

    methods: {
        //显示删除按钮
        showDeleteBtn(item) {
            const { bmpNodeDTO, dealStat } = item;
            return !bmpNodeDTO || this.toBeDeleted(dealStat);
        },
        //显示维护按钮
        isMaintained(item) {
            const { dealStat } = item;
            return ['1', '2'].includes(dealStat);
        },
        //待删除
        toBeDeleted(dealStat) {
            return dealStat === '4';
        },
        //待移除
        toBeRemoved(dealStat) {
            return dealStat === '5';
        },
        //待添加
        toBeAdded(dealStat) {
            return dealStat === '6';
        },
        nodeClick(ctx) {
            if (ctx.dealStat === '3') {
                //已维护的节点不允许点击
                return;
            }
            if (ctx.dealStat === '4') {
                this.toBeDeletedOpt(ctx);
                return;
            }
            if (ctx.dealStat === '5') {
                this.toBeRemovedOpt(ctx);
                return;
            }
            if (ctx.dealStat === '6') {
                this.toBeAddedOpt(ctx);
                return;
            }
            this.current = ctx;
            this.$emit('nodeClick', ctx);
        }
    }
};
</script>
<template>
    <div
        class="item"
        :class="{ calc: isBranchNode }"
    >
        <div v-if="isStartNode || isEndNode" :id="nodeId" class="start">
            <div class="text">{{ nodeLabel }}</div>
        </div>
        <div v-else-if="isBranchNode" :id="nodeId" class="branch">
            <div class="diamond"></div>
            <div class="text">{{ nodeLabel }}</div>
        </div>
        <div
            v-else
            :id="nodeId"
            class="node"
            :class="{
                is_maintained: nodeStat === '3',
                active: isActive,
                select: isNodeInclude(nodeId),
                disabled: !isNodeInclude(nodeId),
                app: isApp
            }"
            @click.stop="nodeClick(node)"
        >
            <!-- <div :id="nodeId" class="point"></div> -->
            <span v-tooltip="nodeLabel" class="label">{{ nodeLabel }}</span>
            <span v-if="nodeStat === '4'" v-tooltip="nodeLabel" class="deal">立即删除</span>
            <span v-else-if="nodeStat === '5'" v-tooltip="nodeLabel" class="deal">立即移除</span>
            <span v-else-if="nodeStat === '6'" v-tooltip="nodeLabel" class="deal">立即添加</span>
            <span v-else v-tooltip="nodeLabel" class="deal">立即维护</span>
            <span v-if="nodeStat === '3'" class="sign">已维护</span>
            <span v-else-if="toBeDeleted(nodeStat)" class="sign toBeDeleted">待删除</span>
            <span v-else-if="toBeRemoved(nodeStat)" class="sign toBeRemoved">待移除</span>
            <span v-else-if="toBeAdded(nodeStat)" class="sign toBeAdded">待添加</span>
            <span v-else-if="nodeStat !== '3' && isActive" class="sign no_deal">待处理</span>
        </div>
    </div>
</template>
<style lang="less" scoped>
.item {
    display: flex;
    // width: 100%;
    justify-content: space-around;
    // position: relative;
    // z-index: 999;
    &.calc {
        margin: 20px 0;
    }
    &.active {
        z-index: 2;
    }
    .text {
        color: rgba(0, 0, 0, 0.4);
        position: absolute;
        z-index: 2;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
    }
    .start {
        height: 40px;
        background: #fff;
        border-radius: 80px;
        border: 1px solid #1D70F5;
        display: flex;
        box-sizing: border-box;
        width: 120px;
        align-items: center;
        justify-content: center;
        margin: 20px 16px;
        position: relative;
        z-index: 1;
        &:hover{
            cursor: pointer;
        }
    }
    .branch {
        width: 64px;
        height: 64px;
        position: relative;
        .diamond {
            left: 50%;
            top: 50%;
            transform: rotate(45deg) translate(-50%, -50%);
            transform-origin: 0 0;
            border: 1px solid #1D70F5;
            background: #fff;
            width: 44px;
            height: 44px;
            position: absolute;
            z-index: 1;
            box-sizing: border-box;
        }
    }
    .node {
        height: 40px;
        background: #fafafa;
        border-radius: 3px;
        border: 1px solid #e6e9ed;
        display: flex;
        box-sizing: border-box;
        width: 180px;
        align-items: center;
        justify-content: center;
        margin: 20px 16px;
        position: relative;
        z-index: -1;
        .point {
            position: absolute;
            width: 1px;
            height: 1px;
            left: 50%;
            top: 0;
        }
        &.disabled {
            cursor: not-allowed;
            opacity: 1;
        }
        &.select {
            border-color: #1D70F5;
            background-color: #fff;
        }
        .view {
            display: none;
            color: #fff;
            transition: all 0.5s;
        }
        .deal {
            display: none;
            color: #fff;
        }
        .label {
            color: rgba(0, 0, 0, 0.4);
            width: 100%;
            height: 100%;
            white-space: nowrap;
            // overflow: hidden;
            text-overflow: ellipsis;
            line-height: 40px;
            box-sizing: border-box;
            padding: 0 10px;
            text-align: center;
            font-size: 12px;
        }
        .sign {
            display: flex;
            position: absolute;
            right: -9px;
            top: -5px;
            color: #fff;
            background-color: #1D70F5;
            padding: 2px;
            border-radius: 0px 2px 0px 2px;
            font-size: 12px;
            transform: scale(0.6);
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
        }
        &.disabled {
            background: #fafafa !important;
            border-color: #e6e9ed !important;
            .label {
                color: rgba(0, 0, 0, 0.24) !important;
            }
            .sign {
                background: #b9b9b9;
            }
        }
        /* 点击 */
        &.active {
            border-color: #e34d59;
            background-color: #e34d59;
            z-index: 5;
            .label {
                color: #fff;
            }
            .sign {
                display: none;
            }
            &.is_maintained {
                border-color: #1D70F5;
                background-color: #1D70F5;
                .label {
                    color: #fff;
                }
            }
        }
        &:hover {
            cursor: pointer;
            background: #fdf1f2 !important;
            border: 1px solid #e34d59;
            .label,
            .sign,
            .view {
                display: none;
            }
            .deal {
                display: block;
                color: #e34d59;
            }
        }
        /* 已维护 */
        &.is_maintained {
            background: #edf4fe;
            border-radius: 3px 3px 3px 3px;
            border: 1px solid #d4e3fc;
            color: #1D70F5;
            &.select {
                border-color: #1D70F5 !important;
                &.app {
                    border-color: #07b6d4 !important;
                }
            }
            .label {
                color: #1D70F5;
            }
            &:hover {
                background: #edf4fe !important;
                .deal {
                    display: none;
                }
                .label {
                    display: block;
                    color: #1D70F5;
                }
            }
        }
        &.app {
            background: #e9f9fa !important;
            border-color: #07b6d4 !important;
            .label {
                color: #07b6d4 !important;
            }
            .sign {
                background: #07b6d4 !important;
            }
        }
    }
}
</style>