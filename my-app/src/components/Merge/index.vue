<template>
</template>
 
<script>
import VueCodemirror from 'vue-codemirror';
import Vue from 'vue';
Vue.use(VueCodemirror)
export default {
    components: {
    },
    data() {
        return {
            // 代码
            code: codes,
            cmOptions: {
                tabSize: 4, // tab的空格个数
                theme: 'dracula', //主题样式
                lineNumbers: true, //是否显示行数
                lineWrapping: true, //是否自动换行
                styleActiveLine: true, //line选择是是否加亮
                matchBrackets: true, //括号匹配
                mode: 'vue', //实现javascript代码高亮
                readOnly: false //只读
            }
        };
    }
};
</script>
 
<style lang="less" scoped>
.code {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
<style lang="stylus">
.CodeMirror {
  height: 100%;
}
</style>