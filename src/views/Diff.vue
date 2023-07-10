<script>
import Diff from '@/components/Diff';
import { dealJson, formatObj,jsonDiff,addSuffix,mergeJson,replaceChart } from '@/components/Diff/utils';
export default {
    name: 'DiffHome',
    props: {},
    components: {
        Diff
    },
    data() {
        return {
            scrollLeft: 0,
            scrollTop: 0,
            leftData: {},
            rightData: {},
            objData: {}
        };
    },
    created() {},
    mounted() {
        this.init();
    },
    methods: {
        init() {
            const leftData = replaceChart(require('@/components/Diff/data.json'));
            const rightData = replaceChart(require('@/components/Diff/data2.json'));
            
            formatObj(leftData, { position: 'left' });
            formatObj(rightData, { position: 'right' });
            addSuffix(leftData,'left')
            addSuffix(rightData,'right')
            this.objData = mergeJson(leftData,rightData)
            // dealJson(leftData,rightData)
            // jsonDiff(leftData,rightData)
            this.leftData = leftData
            this.rightData = rightData

        },
        scroll(e) {
            this.scrollLeft = e.target.scrollLeft;
            this.scrollTop = e.target.scrollTop;
        }
    }
};
</script>

<template>
    <div class="diff_body">
        <div class="diff_item">
            <Diff
                ref="left"
                :scrollLeft="scrollLeft"
                :scrollTop="scrollTop"
                :data="objData"
                position="left"
                @scroll="scroll"
            />
        </div>
        <div class="diff_item">
            <Diff
                ref="right"
                :scrollLeft="scrollLeft"
                :scrollTop="scrollTop"
                :data="objData"
                position="right"
                @scroll="scroll"
            />
        </div>
    </div>
</template>

<style lang='less' scoped>
.diff_body {
    display: flex;
    margin: 20px 50px;
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100% - 50px);
    border: 1px solid red;
    background: #fff;
    .diff_item {
        width: 50%;
    }
}
</style>