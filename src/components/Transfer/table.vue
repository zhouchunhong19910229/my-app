<script>
import Vue from 'vue';
import 'xe-utils';
import vxeTable from 'vxe-table';
import 'vxe-table/lib/style.css';
Vue.use(vxeTable);
export default {
    name: 'TableBatchDeal',
    components: {},
    props: {
        cells: Array,
        rules: Object,
        datas: Object,
        isMerge: {
            //是否进行合并
            type: Boolean,
            default: false
        },
        showCheckbox: Boolean
    },
    data() {
        return {
            loading: false,
            tableDatas: [],
            isChecedkAll: false
        };
    },
    computed: {
        indeterminateAll() {
            const list = this.tableDatas.filter((t) => t.checked);
            const all = this.tableDatas.every((t) => t.checked);
            return list.length > 0 && !all;
        },
        checkedAll() {
            const all = this.tableDatas.every((t) => t.checked);
            const list = this.tableDatas.filter((t) => t.checked);
            return list.length > 0 && all;
        }
    },
    watch: {
        datas() {
            this.initDatas();
        },
        checkedAll(val) {
            this.isChecedkAll = val;
        }
    },
    created() {
        this.index = 1;
        this.timmer = null;
    },
    mounted() {
        this.initDatas();
    },
    beforeDestroy() {},
    methods: {
        initDatas() {
            this.checkPassedList = [];
            this.loading = true;
            const { list = [], key } = this.datas || {};
            if (this.isMerge) {
                if (this.table_key !== key) {
                    this.index = 1;
                    this.tableDatas = [];
                }
                this.table_key = key;
                //先将新的数据和缓存进行拼接
                const tableDatas = [
                    ...this.tableDatas,
                    ...list.filter((d) => {
                        const { key } = d;
                        return !this.tableDatas.some((s) => s.key === key);
                    })
                ];
                //此处必需  后端验证后返回错误信息 需要回填
                this.tableDatas = tableDatas.map((t) => {
                    const { key } = t;
                    const item = key ? list.find((d) => d.key === key) : {};
                    return {
                        ...t,
                        ...item
                    };
                });
            } else {
                this.tableDatas = list;
            }
            this.$nextTick(() => {
                this.loading = false;
            });
        },
        getScrollTop(index) {
            if (!this.$refs['table']) return; //不存在这个表格则返回
            let elTable = this.$refs['table'].$el;
            if (!elTable) return;
            const scrollParent = elTable.querySelector('.vxe-table--body-wrapper');
            const targetTop = scrollParent
                .querySelectorAll('.vxe-table--body tr')
                [index].getBoundingClientRect().top; //该行的位置
            const containerTop = elTable
                .querySelector('.vxe-table--body')
                .getBoundingClientRect().top; //body的位置
            setTimeout(() => {
                scrollParent.scrollTop = targetTop - containerTop; //跳转到存下编辑行的ScrollTop
            }, 0);
        },
        validateOpt(isValidate, checked) {
            let list = this.tableDatas;
            if (checked) {
                list = this.tableDatas.filter((t) => t.checked);
            }
            list.forEach((dd, index) => {
                Object.keys(dd?.msg).forEach((key) => {
                    this.inputBlur(key, dd, index);
                    if (typeof isValidate === 'function') {
                        isValidate(key, dd, index);
                    }
                });
            });
            this.checkPassedList = list.filter((t) => {
                const { msg } = t || {};
                return Object.values(msg).every((r) => !r);
            });
            return list.findIndex((dd) => {
                const { msg } = dd || {};
                return Object.values(msg).filter((val) => val)?.length > 0;
            });
        },
        //获取验证通过的数据
        getPassList() {
            return this.checkPassedList;
        },
        /* 是否进行验证 */
        getData(isValidate, checked, isValidatePassed) {
            if (isValidate) {
                const index = this.validateOpt(isValidate, checked);
                //只返回验证通过的数据
                if (isValidatePassed) {
                    return this.tableDatas.filter((t) => {
                        return Object.values(t.msg).every((e) => !e);
                    });
                }
                if (index > -1) {
                    //this.getScrollTop(index);
                    this.$message.error('数据校验不通过');
                    throw new Error('数据校验不通过');
                }
            }

            return checked ? this.tableDatas.filter((t) => t.checked) : this.tableDatas;
        },
        inputBlur(property, row, index) {
            const val = row[property];
            const list = this.tableDatas;
            if (this.rules[property]) {
                const { required, message, validator, repeat = true } = this.rules[property];
                let filter = (row, property) => {
                    const datas = list.filter((d) => d[property] === row[property]);
                    return datas.length > 1;
                };
                row.msg[property] = '';
                if (required && !val) {
                    row.msg[property] = '必填项';
                    return;
                }
                if (validator) {
                    const prompt = validator(val, row, list);
                    if (prompt) {
                        row.msg[property] = prompt;
                        return;
                    }
                }
                if (repeat && filter(row, property)) {
                    row.msg[property] = '重复字段';
                    filter = null;
                    return;
                }
                this.$forceUpdate();
            }
            if (typeof row.blur === 'function') {
                row.blur(property, row, index);
            }
        },
        async textareaOpt(el) {
            const target = el.target;
            const { _value = '', value = '' } = target;
            if (_value === value) {
                //内容无变化 则直接返回 减少计算消耗
                return;
            }
            let height = target.scrollHeight;
            const basic_h = 32;
            if (_value && !value) {
                height = basic_h;
            }
            if (height > basic_h * 3) {
                height = basic_h * 3;
            }
            target.style.height = `${height}px`; //10 为 上下内边距
        },
        isFill(row, property) {
            const { changeMap = {} } = row || {};
            return changeMap[property];
        },
        cellClassnName({ column: { field } }) {
            const { class_name = '' } = this.cells.find((c) => c.prop === field) || {};
            return class_name;
        },
        onScroll(e) {
            const { bodyHeight, scrollTop, scrollHeight } = e;
            clearTimeout(this.timmer);
            this.timmer = setTimeout(() => {
                if (scrollTop > 0 && Math.ceil(scrollTop) + bodyHeight >= scrollHeight - 1) {
                    // 减 1 是为了规避dom计算的时候出现的 差值 1
                    this.index += 1;
                    //向下滚动
                    //this.$emit('scrollDown', { pageIndex: this.index });
                }
            }, 10);
        },
        checkAll(val) {
            this.tableDatas.forEach((t) => {
                if (!t.checkedIsDisabled) {
                    this.$set(t, 'checked', val);
                    this.checkedIsChange(t);
                }
            });
        },
        checkedIsChange(row) {
            this.$set(row, 'disabled', !row.checked);
        },
        inputTextareaOpt(el) {}
    }
};
</script>
<template>
    <div class="table_wrap">
        <vxe-table
            ref="table"
            v-loading="loading"
            :data="tableDatas"
            :header-cell-class-name="cellClassnName"
            :cell-class-name="cellClassnName"
            show-overflow
            :scroll-y="{ enabled: true, gt: 100 }"
            v-bind="$attrs"
            height="100%"
            style="width: 100%"
            v-on="$listeners"
            @scroll="onScroll($event)"
        >
            <!-- :checkbox-config="{ checkMethod:checkMethod }" -->
            <!-- <vxe-column v-show="showCheckbox" type="checkbox" width="40"></vxe-column> -->
            <vxe-column
                v-for="cell in cells"
                :key="cell.prop"
                :title="cell.label"
                :field="cell.prop"
                :cell-class-name="cell.class_name || ''"
                :width="cell.width || 'auto'"
                :min-width="cell.minWidth || 'auto'"
                :fixed="cell.fixed || ''"
            >
                <template slot="header" slot-scope="scope">
                    <div class="header_item">
                        <el-checkbox
                            v-if="cell.type === 'checkbox'"
                            v-model="isChecedkAll"
                            :indeterminate="indeterminateAll"
                            @change="checkAll"
                        ></el-checkbox>
                        <div v-else class="text">
                            {{ scope.column.title }}
                            <span v-if="cell.must" class="must">*</span>
                        </div>
                        <div v-tooltip="cell.prompt" class="icon">
                            <Icon v-if="cell.prompt" iconClass="icon-cuowu" />
                        </div>
                    </div>
                </template>
                <template slot-scope="{ row, $rowIndex: $index, column: { property } }">
                    <el-checkbox
                        v-if="cell.type === 'checkbox'"
                        v-model="row.checked"
                        :disabled="row.checkedIsDisabled"
                        @change="checkedIsChange(row)"
                    ></el-checkbox>
                    <el-select
                        v-else-if="cell.type === 'select'"
                        v-model="row[property]"
                        :disabled="row.disabled"
                        :class="{ error: row.msg && row.msg[property] }"
                        @change="cell.change && cell.change(row[property], { row, $index })"
                    >
                        <el-option
                            v-for="item in cell.list"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        ></el-option>
                    </el-select>
                    <div v-else-if="['input', 'textarea'].includes(cell.type)" class="input_item">
                        <!-- :autosize="{ minRows: 1, maxRows: 3 }" -->
                        <textarea
                            v-if="cell.type === 'textarea'"
                            v-model.lazy="row[property]"
                            :disabled="row.disabled"
                            :class="{
                                error: row.msg && row.msg[property],
                                fill:
                                    isFill(row, property) && isFill(row, property) !== row[property]
                            }"
                            :rows="1"
                            @blur="row.blur && inputBlur(property, row, $index)"
                            @input="textareaOpt($event, cell.type, row[property])"
                        ></textarea>
                        <input
                            v-else
                            v-model.lazy="row[property]"
                            :disabled="row.disabled"
                            :type="row.type"
                            class="z_input"
                            :class="{
                                error: row.msg && row.msg[property],
                                fill:
                                    isFill(row, property) && isFill(row, property) !== row[property]
                            }"
                            @blur="row.blur && inputBlur(property, row, $index)"
                        />

                        <el-tooltip effect="dark" placement="top" :content="isFill(row, property)">
                            <Icon
                                v-if="
                                    isFill(row, property) && isFill(row, property) !== row[property]
                                "
                                iconClass="icon-fill"
                                @click="!row.disabled && (row[property] = isFill(row, property))"
                            />
                        </el-tooltip>
                    </div>
                    <slot
                        v-else-if="cell.slot"
                        :name="cell.slot"
                        :params="{ row, $index, column: { property } }"
                    />
                    <span v-else class="text">{{ row[property] || cell.auto_value }}</span>
                    <span v-if="row.msg && row.msg[property]" class="prompt">{{
                        row.msg[property]
                    }}</span>
                </template>
            </vxe-column>
        </vxe-table>
    </div>
</template>
<style scoped lang="less">
.table_wrap {
    width: 100%;
    height: 100%;
    position: relative;

    ::v-deep .el-loading-mask {
        background: rgba(0, 0, 0, 0.4);
    }

    .prompt {
        color: red;
        white-space: normal !important;
    }

    ::v-deep .vxe-table {
        * {
            font-size: 12px;
            //vertical-align: top;
        }
        .el-checkbox__inner::after {
            left: 5.5px !important;
            top: 3px !important;
        }
        thead {
            color: #333;
        }

        ::-webkit-scrollbar {
            height: 6px;
            width: 6px;
        }

        .header_item {
            display: flex;
            align-items: center;
            padding-left: 4px;
            .must {
                color: red;
                margin: 0 4px;
            }
            .icon {
                display: flex;
                margin-left: 4px;

                .svg-icon {
                    width: 14px;
                    height: 14px;
                    cursor: pointer;
                    color: rgba(0, 0, 0, 0.26);

                    &:hover {
                        color: @theme_color;
                    }
                }
            }
        }
        .error {
            border-color: red !important;
        }

        .vxe-cell {
            padding: 0 6px 0 10px;

            //margin-top: 8px;
            .text {
                line-height: 20px;
                box-sizing: border-box;
                padding: 6px 0 0 0;
                display: flex;
            }

            .el-select {
                width: 100%;
                font-size: 12px;

                &.error {
                    .el-input__inner {
                        border: 1px solid red !important;
                    }
                }
            }

            .el-textarea__inner,
            .el-input__inner {
                padding-right: 8px;
                padding-left: 8px;
            }

            .input_item {
                position: relative;

                input,
                textarea {
                    padding: 0 8px;
                    box-sizing: border-box;
                    border: 1px solid #dcdfe6;
                    border-radius: 4px;
                    width: 100%;
                    &:disabled {
                        color: rgba(0, 0, 0, 0.26);
                        background-color: #f5f7fa;
                    }
                    &.fill {
                        border-color: @theme_color;
                    }
                }

                input {
                    height: 32px;
                }

                textarea {
                    resize: none;
                    padding: 5px 8px;
                    min-height: 32px !important;
                }

                .svg-icon {
                    position: absolute;
                    right: 8px;
                    width: 14px;
                    height: 20px;
                    cursor: pointer;
                    color: rgba(0, 0, 0, 0.26);
                    bottom: 6px;

                    &:hover {
                        color: @theme_color;
                    }
                }
            }
        }

        .vxe-header--column {
            height: 48px;
            padding: 0;
            vertical-align: middle;

            .vxe-cell {
                margin-top: 0;

                .header_item {
                    padding-left: 0;

                    .text {
                        padding-top: 0;
                        white-space: nowrap;
                    }
                }
            }
        }

        .vxe-body--column {
            vertical-align: top;
            padding-top: 8px;
            height: auto !important;
            .vxe-cell {
                max-height: unset !important;
                .text {
                    padding-left: 1px;
                    padding-bottom: 8px;
                }
                .el-checkbox {
                    margin-top: 4px;
                }
            }
        }
    }
}
</style>
