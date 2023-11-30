<script>
import MergeDiff from './utils';
export default {
    name: 'MergeAndDiff',
    props: {
        leftLabel: String,
        rightLabel: String,
        leftData: {
            type: Object,
            default: () => {}
        },
        rightData: {
            type: Object,
            default: () => {}
        },
        mode: {
            type: String,
            default: '2' //模式 1、merge、 2、diff
        },
        showTop: Boolean,
        beforeMerge: Function,
        afterMerge: Function,
        beforeRemove: Function,
        afterRemove: Function
    },
    data() {
        return {
            merge: null
        };
    },
    watch: {
        leftData() {
            this.init();
        },
        rightData() {
            this.init();
        }
    },

    mounted() {
        this.init();
    },

    methods: {
        deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        init() {
            this.merge = new MergeDiff(
                this.deepClone(this.leftData),
                this.deepClone(this.rightData),
                this.$refs.left,
                this.$refs.right,
                this.mode,
                {
                    afterMerge: this.afterMerge
                }
            );
        },
        getLeftData() {
            const { leftData } = this.merge;
            return leftData;
        },
        scroll(e) {
            this.scrollTop(e.target.scrollTop);
            this.scrollLeft(e.target.scrollLeft);
        },
        scrollTop(num) {
            this.$nextTick(() => {
                this.$refs.leftDiff.scrollTop = num;
                this.$refs.rightDiff.scrollTop = num;
            });
        },
        scrollLeft(num) {
            this.$nextTick(() => {
                this.$refs.leftDiff.scrollLeft = num;
                this.$refs.rightDiff.scrollLeft = num;
                const leftLines = document.querySelectorAll('.diff-item .line.left');
                leftLines.forEach((line) => {
                    line.style.right = `-${num}px`;
                });
                const rightLines = document.querySelectorAll('.diff-item .line.right');
                rightLines.forEach((line) => {
                    line.style.left = `${num}px`;
                });
            });
        }
    }
};
</script>
<template>
    <div class="diff-body">
        <div class="diff-item left">
            <div v-if="showTop" class="top-item">{{ leftLabel }}</div>
            <div ref="leftDiff" :class="['bottom-item', { showTop }]" @scroll="scroll">
                <div ref="left" class="parent-item"></div>
            </div>
        </div>
        <div class="diff-item right">
            <div v-if="showTop" class="top-item">{{ rightLabel }}</div>
            <div ref="rightDiff" :class="['bottom-item', { showTop }]" @scroll="scroll">
                <div ref="right" class="parent-item"></div>
            </div>
        </div>
    </div>
</template>
<style lang="less" scoped>
@import url('./index.less');
</style>