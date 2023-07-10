<template>
    <div class="wrap">
        <Diff :oldContent="oldContent" :newContent="newContent"/>
    </div>
</template>

<script>
import Diff from '@/components/CodeDiffViewer';
export default {
    name: 'MyAppNewDiff',
    components:{
        Diff
    },
    data() {
        return {
            newContent:"",
            oldContent:""
        };
    },

    mounted() {
        const leftData = require('@/components/Diff/data.json');
        const rightData = require('@/components/Diff/data2.json');
        this.oldContent = JSON.stringify(leftData, null, 2)
        this.newContent = JSON.stringify(rightData, null, 2)
    },

    methods: {
        
    },
};
</script>

<style lang="less" scoped>
    .wrap{
        height: 100%;
    }
</style>