<script>
import { jsPlumb } from 'jsplumb';
let diff = { x: 0, y: 0 }; // 相对于上一次pointermove移动差值
let lastPoint = { x: 0, y: 0 }; // 用于计算diff
// import { queryFlow, deleteFlow, addFlow } from '@/api/modules/microServiceApi.js';
import Chart from './Chart.vue';
import Child from './Child.vue';
import { formatNodes } from './utils';
export default {
    name: 'FlowChart',
    components: {
        Chart,
        Child
    },
    props: {
        data: Object,
        versionNo: String,
        type: String,
        disabled: Boolean
    },
    data() {
        return {
            x: 0,
            y: 0,
            scale: 100,
            loading: false,
            nodes: [],
            links: [],
            selectList: [], //选中节点
            hasNotLineNodes: [],
            treeDatas: {},
            endNode: null
        };
    },
    computed: {
        style() {
            return `transform: translate(${this.x}px,${this.y}px) scale(${this.scale / 100});transform-origin:center 0;`;
        },
        isApp() {
            return this.type === 'appService';
        }
    },
    watch: {
        versionNo() {
            this.initChart();
        }
    },
    created() {
        this.plumbIns = jsPlumb.getInstance();
    },
    mounted() {
        // this.$nextTick(() => {
        //     this.$refs.content.onmousedown = this.onMouseDown;
        // });
        window.addEventListener('resize', () => {
            this.drawLine();
        });
        this.initChart();
    },
    beforeDestroy() {
        window.removeEventListener('resize', () => {});
    },
    methods: {
        async queryData() {
            const params = {
                type: this.type,
                serviceVersionNo: this.versionNo
            };
            return await queryFlow(params);
        },

        async initChart() {
            this.x = 0;
            this.y = 0;
            // const { lines = [], listTask, listFlow, stepNodeList } = (await this.queryData()) || {};
            const {
                data: { lines = [], listTask, listFlow, stepNodeList }
            } = require('./data.json');
            const nodes = listTask || stepNodeList || [];
            if (nodes?.length === 0) {
                return;
            }
            nodes.forEach((t) => {
                const { nodeId, nodeName } = t;
                t.id = nodeId;
                t.label = nodeName;
                t.disabled = false;
                t.isShow = true;
            });
            this.startNode = nodes.find((t) => t.nodeType === '3');
            this.endNode = nodes.find((t) => t.nodeType === '4');
            this.branchNodeist = nodes.filter((t) => t.nodeType === '2');
            this.hasNotLineNodes = nodes.filter(
                (t) => !lines.some((l) => [l.from, l.to].includes(t.id))
            );
            this.treeDatas = formatNodes({ lines, nodes });
            const { listTask: selects } = listFlow || {};
            // if(this.isApp) {
            //     this.selectList =
            //         [...selects, nodes.filter((t) => ['3', '4'].includes(t.nodeType))] || [];
            // }
            this.nodes = nodes.map((t) => {
                const { nodeName, id } = t || {};
                return {
                    ...t,
                    label: nodeName,
                    disabled: !this.isNodeInclude(id)
                };
            });
            this.links = lines.map((t) => {
                const { from, to } = t;
                let color = '#1D70F5';
                return {
                    ...t,
                    source: from,
                    target: to,
                    paintStyle: { stroke: color, strokeWidth: 1 }
                };
            });
            this.drawLine();
        },
        nodeClick(ctx) {
            this.$emit('nodeClick', ctx);
        },

        getDefaultConfig() {
            const overlays = [
                [
                    'Arrow',
                    {
                        width: 6,
                        length: 6,
                        location: 1,
                        direction: 1, // 方向，默认值为1（表示向前），可选-1（表示向后）
                        foldback: 1 // 折回，也就是尾翼的角度，默认0.623，当为1时，为正三角
                    }
                ]
            ];
            return {
                isSource: true,
                isTarget: true,
                connector: ['Flowchart' /* 'Bezier' */ /*  'StateMachine' */],
                endpoint: 'Blank',
                overlays,
                endpointHoverStyle: { color: '#1D70F5' },
                // renderMode: 'canvas',
                // dragOptions: { cursor: 'pointer', zIndex: 2000 },
                hoverPaintStyle: { stroke: 'red', strokeWidth: 3, cursor: 'pointer' },
                // connectorHoverStyle: { stroke: 'red' },
                maxConnections: -1
            };
        },
        //连线
        drawLine() {
            this.plumbIns.reset();
            this.$nextTick(() => {
                this.loading = false;
                this.links?.forEach((line) => {
                    let defaultConfig = this.getDefaultConfig();
                    const { source, target, label } = line;
                    const isFromeBranchLine = this.branchNodeist.find((t) => t.id === source);
                    const isToBranchLine = this.branchNodeist.find((t) => t.id === target);
                    const { id: endNodeId } = this.endNode;
                    const isToEndLine = endNodeId === target;
                    if (label) {
                        defaultConfig.overlays = [
                            ...defaultConfig.overlays,
                            [
                                'Label',
                                {
                                    location: 0.5,
                                    label: `<span class="line-label">${label}</span>`
                                }
                            ]
                        ];
                    }
                    if (isFromeBranchLine) {
                        defaultConfig.anchor = ['Top', 'Bottom' /* 'Left', 'Right' */];
                    } else if (isToBranchLine) {
                        // defaultConfig.anchor = 'Continuous';
                        defaultConfig.anchor = ['Top', 'Bottom' /* 'Left', 'Right' */];
                    } else if (isToEndLine) {
                        defaultConfig.anchor = [
                            'Top',
                            'Bottom',
                            'Left',
                            'Right'
                            // [0.6, 0, 0, -1],
                            // [0.4, 1, 0, 1],
                            // [0.6, 1, 0, 1]
                        ];
                        defaultConfig.anchor = 'Continuous'; //动态锚点
                    } else {
                        defaultConfig.anchor = ['Top', 'Bottom'];
                    }
                    // defaultConfig.anchor = 'Continuous'; //动态锚点
                    // this.plumbIns.draggable(target);
                    this.plumbIns.connect({ ...line, endpoint: 'Rectangle' }, defaultConfig);
                    this.plumbIns.repaintEverything(); // 重绘
                });
            });
        },
        onMouseDown(event) {
            event.preventDefault();
            lastPoint = { x: event.clientX, y: event.clientY };
            document.onmousemove = (e) => {
                const ctx = { x: e.clientX, y: e.clientY };
                diff.x = ctx.x - lastPoint.x;
                diff.y = ctx.y - lastPoint.y;
                lastPoint = { x: ctx.x, y: ctx.y };
                this.x += diff.x;
                this.y += diff.y;
            };
            document.onmouseup = (e) => {
                document.onmousemove = null;
            };
        },
        onMouseWheel(event) {
            event.preventDefault();
            if (event.wheelDelta > 0) {
                //向上 放大
                if (this.scale >= 1000) {
                    this.scale = 1000;
                } else {
                    this.scale += 10;
                }
            } else {
                if (this.scale <= 50) {
                    this.scale = 50;
                } else {
                    this.scale -= 10;
                }
            }
        },
        isNodeInclude(id) {
            if (!this.selectList || this.selectList.length === 0) {
                return true;
            }
            return this.selectList.some((t) => t.id === id);
        },
        toBeDeletedOpt(item) {
            this.$confirm('该操作将会丢失您的数据，确认移除？', '确定移除吗', {
                center: true
            }).then(() => {
                const { nodeId, type, taskSort, stepSort } = item;
                const params = {
                    nodeId,
                    type,
                    serviceVersionNo: this.versionNo,
                    sort: taskSort || stepSort
                };
                deleteFlow(params).then((res) => {
                    this.$message.success('移除成功');
                    this.initChart();
                });
            });
        },
        toBeAddedOpt(item) {
            this.$confirm('当前数据已维护至平台,是否添加到服务中？', '确定添加吗', {
                center: true
            }).then(() => {
                const { nodeId, type } = item;
                const params = {
                    nodeId,
                    type,
                    serviceVersionNo: this.versionNo
                };
                addFlow(params).then((res) => {
                    this.$message.success('添加成功');
                    this.initChart();
                });
            });
        }
    }
};
</script>
<template>
    <div ref="content" class="flow_wrap" :class="{ disabled }">
        <div class="tree-nodes">
            <Child
                :node="treeDatas"
                :isNodeInclude="isNodeInclude"
                :toBeDeletedOpt="toBeDeletedOpt"
                :toBeAddedOpt="toBeAddedOpt"
                @nodeClick="nodeClick"
            ></Child>
        </div>
        <div v-if="hasNotLineNodes.length > 0" class="tree-nodes notLine">
            <Chart
                v-for="node in hasNotLineNodes"
                :key="node.id"
                :node="node"
                :isNodeInclude="isNodeInclude"
                :toBeDeletedOpt="toBeDeletedOpt"
                :toBeAddedOpt="toBeAddedOpt"
                @nodeClick="nodeClick"
            />
        </div>
    </div>
</template>
<style scoped lang="less">
.flow_wrap {
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;
    flex-direction: column;
    user-select: none;
    overflow: auto;
    .tree-nodes {
        width: fit-content;
        &.notLine {
            display: flex;
            .item {
                width: auto;
            }
        }
    }
    &.disabled {
        opacity: 1;
    }
}
</style>

<style>
.line-label {
    color: #8c8c8c;
    background: #fff;
    padding: 4px 6px;
}
</style>

