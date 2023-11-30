<script>
import { displayJson,getJson } from './utils';
export default {
    name: 'Diff',
    props: {
        scrollLeft: Number,
        scrollTop: Number,
        data: {
            type: Object,
            default: () => {}
        },
        position: String
    },
    components: {},
    watch: {
        scrollLeft(num) {
            this.$nextTick(() => {
                this.$refs.wrap.scrollLeft = num;
            });
        },
        scrollTop(num) {
            this.$nextTick(() => {
                this.$refs.wrap.scrollTop = num;
            });
        },
        data() {
            this.init();
        }
    },
    data() {
        return {};
    },
    created() {},
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.$nextTick(() => {
                const ul = this.$refs.content;
                ul.innerHTML = '';
                displayJson(this.data, ul, this.position);
            });
        },
        getData() {
            const data = this.$refs.content.innerText.replace(/\d+\n/g, '').replace(/\n/g, '')
            console.log(data)
            return JSON.parse(data)
        }
    }
};
</script>

<template>
    <div class="diff_wrap" ref="wrap" @scroll="(e) => $emit('scroll', e)">
        <ul ref="content" class="content"></ul>
        <button @click="getData()">获取</button>
    </div>
</template>

<style lang='less' scoped>
.diff_wrap {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-size: 14px;
    background: #fff;
    box-sizing: border-box;
    padding: 0;
    overflow-x: auto;
    position: relative;
    ul,
    li {
        list-style: none;
        text-align: left;
        position: relative;
    }

     /* 设置滚动条样式 */
    &::-webkit-scrollbar {
        width: 8px; /* 设置滚动条宽度 */
        height: 8px; /* 设置滚动条高度 */
    }

    /* 滚动条背景 */
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    /* 滚动条滑块 */
    &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }

    /* 滚动条滑块悬停 */
    &::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
}
.line {
    position: absolute;
    left: 0;
    width: 50px;
}
</style>