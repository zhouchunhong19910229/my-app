<script>
import Diff from '@/components/MergeDiff';
export default {
    name: 'DiffHome',
    props: {},
    components: {
        Diff
    },
    data() {
        return {
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
            const data = require('./data.json');
            // const leftData = require('./left.json');
            // const rightData = require('./right.json');
            this.leftData = JSON.parse(data.data[0].data);
            this.rightData = JSON.parse(data.data[1].data);
            window.addEventListener('message', (event) => {
                console.log('parent:' , event);
            });
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
            });
        }
    }
};
</script>

<template>
    <div class="diff_home_body">
        <iframe id="iframe" src="/NewDiff" frameborder="0" width="100%" height="100%"></iframe>
        <Diff
            leftLabel="story/2.0/069-报文头"
            rightLabel="story/2.0/070-报文头"
            :leftData="leftData"
            :rightData="rightData"
            mode="1"
        />
    </div>
</template>

<style lang='less' scoped>
.diff_home_body {
    display: flex;
    // margin: 20px;
    height: 100%;
    background: #fff;
    width: 1500px;
    height: 800px;
}
</style>