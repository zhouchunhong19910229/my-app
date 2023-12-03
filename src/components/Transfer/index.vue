
<script>
export default {
    name: 'NewTransferShared',
    components: {
        TableShared: () => import('./table.vue')
    },
    props: {
        left: Array,
        right: Array,
        props: {
            type: Object,
            default: () => ({
                uuid: 'propNo', //唯一标识  必传
                name: 'name'
            })
        }
    },
    data() {
        return {
            leftAll: {
                value: '',
                indeterminate: false,
                disabled: false,
                change: this.change,
                label: ''
            },
            rightAll: {
                value: '',
                indeterminate: false,
                disabled: false,
                change: this.change,
                label: ''
            },
            cells: [
                {
                    slot: 'leftChecked',
                    prop: 'leftChecked'
                },
                {
                    label: '',
                    prop: 'label'
                }
            ],
            leftDatas: []
        };
    },
    watch: {
        right() {
            this.initData();
        }
    },
    created() {
        this.initData();
    },

    mounted() {},

    methods: {
        initData() {
            this.max = 20;
            this.end = this.max;
            const { uuid } = this.props;
            this.cache = this.left.map((t) => {
                return {
                    ...t,
                    checked: this.right.some((d) => d[uuid] === t[uuid])
                };
            });
            this.cache.sort((s, t) => {
                return t.checked - s.checked;
            });
        },
        getLabel(item) {
            return item.label;
        }
    }
};
</script>
<template>
    <div class="transfer">
        <div class="transfer_item">
            <div class="transfer_item_top">
                <el-checkbox
                    v-model="leftAll.value"
                    :indeterminate="leftAll.indeterminate"
                    :disabled="leftAll.disabled"
                    @change="leftAll.change"
                    >{{ leftAll.data }}</el-checkbox
                >
            </div>
            <div class="transfer_item_bottom">
                <div class="filter"></div>
                <div class="content">
                    <TableShared :cells="cells" :datas="{ list: leftDatas, key: 'leftTableKey' }">
                        <div slot="leftChecked" slot-scope="{ params: { row } }">
                            <el-checkbox
                                v-model.lazy="row.checked"
                                :disabled="row.disabled"
                                :title="getLabel(item)"
                                @change="leftChange"
                                >{{ getLabel(item) }}</el-checkbox
                            >
                        </div>
                    </TableShared>
                </div>
            </div>
        </div>
        <div class="transfer_item">
            <div class="transfer_item_top">
                <el-checkbox
                    v-model="rightAll.value"
                    :indeterminate="rightAll.indeterminate"
                    :disabled="rightAll.disabled"
                    @change="rightAll.change"
                    >{{ rightAll.data }}</el-checkbox
                >
            </div>
            <div class="transfer_item_bottom">
                <div class="filter"></div>
                <div class="content">
                    <TableShared
                        :cells="cells"
                        :datas="{ list: leftDatas, key: 'leftTable' }"
                    ></TableShared>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="less" scoped>
.transfer {
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 350px;
    &_item {
        width: 50%;
        border: 1px solid #e4e4e4;
        flex-direction: column;
        box-sizing: border-box;
        &:first-child {
            border-right: 0;
        }
        &_top {
            display: flex;
            justify-content: space-between;
            background: #f5f7fa;
            height: 35px;
            box-sizing: border-box;
            padding: 0 10px;
            align-items: center;
        }
    }
}
</style>