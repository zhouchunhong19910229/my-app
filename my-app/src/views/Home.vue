<template>
    <div class="home">
        <Diff />
    </div>
</template>

<script>
// @ is an alias to /src
import Diff from './Diff';
export default {
    name: 'Home',
    components: {
        Diff
    },
    data() {
        return {};
    },
    methods: {}
};
</script>

<style lang="less" scoped>
.home {
    background: #ccc;
    overflow: hidden;
    height: 100vh;
}
</style>
