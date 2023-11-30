<template>
    <Merge :leftData="leftData" :rightData="leftData" />
</template>

<script>
import Merge from '@/components/Merge';
export default {
    name: 'MyAppMerge',
    components: {
        Merge
    },
    data() {
        return {
            leftData:null,
            rightData:null
        };
    },

    mounted() {
        this.init()
    },

    methods: {
        init() {
            this.leftData = require('@/components/Diff/data.json');
            this.rightData = require('@/components/Diff/data2.json');
        },
    }
};
</script>

<style lang="less" scoped>
</style>