
import './index.less'
const isObject = (obj) => Object.prototype.toString.call(obj) === "[object Object]"
const isArray = (obj) => Object.prototype.toString.call(obj) === "[object Array]"
const whiteList = ['position', 'position:left', 'position:right', 'diffKey', 'diffKey:left', 'diffKey:right', 'isUpdate', 'isEmpty'] //需要跳过校验的字段
const mergeIcon = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.78019 3.34373L9.09076 2.6543L5.74604 5.99901L9.09076 9.34373L9.78019 8.6543L7.1249 5.99901L9.78019 3.34373Z" fill="#E34D59"/>
<path d="M6.03024 3.34373L5.34081 2.6543L1.99609 5.99901L5.34081 9.34373L6.03024 8.6543L3.37495 5.99901L6.03024 3.34373Z" fill="#E34D59"/>
</svg>`
const removeIcon = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.00004 6.68971L8.30696 8.99664L8.99639 8.30721L6.68947 6.00028L8.99639 3.69336L8.30696 3.00393L6.00004 5.31085L3.69309 3.00391L3.00366 3.69334L5.31061 6.00028L3.00366 8.30723L3.69309 8.99666L6.00004 6.68971Z" fill="#E34D59"/>
</svg>`
const Status = {
      LeftAdd: "LeftAdd",
      rightAdd: "rightAdd",
      Diff: "Diff"
}

const DataType = {
      Array: 'array',
      Object: 'object'
}


export default class MergeDiff {
      constructor(...args) {
            const [left, right, leftDom, rightDom, mode, callback] = [...args]
            this.formatJson(left)
            this.formatJson(right)
            this.leftData = left
            this.rightData = right
            this.leftDom = leftDom
            this.rightDom = rightDom
            this.mode = mode
            if (callback) {
                  const { afterMerge, beforeMerge, beforeRemove, afterRemove } = callback
                  this.beforeMerge = beforeMerge
                  this.afterMerge = afterMerge
                  this.beforeRemove = beforeRemove
                  this.afterRemove = afterRemove
            }
            this.reLoad()
      }
      //重绘
      reDraw() {
            try {
                  //设置左右容器宽度一致
                  const [leftBottomItem, rightBottomItem] = document.querySelectorAll(".bottom-item")
                  const maxWidth = Math.max(leftBottomItem.scrollWidth, rightBottomItem.scrollWidth)
                  leftBottomItem.querySelector('&>.parent-item').style.width = `${maxWidth}px`
                  rightBottomItem.querySelector('&>.parent-item').style.width = `${maxWidth - 35}px`

                  /* const leftParentItems = leftBottomItem.querySelectorAll('.parent-item')
                  const rightParentItems = rightBottomItem.querySelectorAll('.parent-item')
                  let fn = (nodeList) => {
                        nodeList.forEach(node => {
                              if (node.querySelector(".status")) {
                                    const parentNode = node.querySelector(".status").parentNode
                                    const statusNodes = parentNode.querySelectorAll(".status")
                                    statusNodes.forEach((p, index) => {
                                          if (index === 0) {//第一个操作按钮要显示
                                                return
                                          }
                                          //p.querySelector(".merge-btn") && (p.querySelector(".merge-btn").remove())
                                          //p.querySelector(".remove-btn") && (p.querySelector(".remove-btn").remove())
                                    })
                              }
                        })
                  }
                  fn(leftParentItems)
                  fn(rightParentItems)
                  fn = null */

            } catch (error) {
                  console.error(error)
            }
      }

      addEvents() {
            const mergeBtns = document.querySelectorAll('.merge-btn')
            for (let i = 0; i < mergeBtns.length; i++) {
                  mergeBtns[i].onclick = this.mergeClick.bind(this)
            }
            const removeBtns = document.querySelectorAll('.remove-btn')
            for (let i = 0; i < removeBtns.length; i++) {
                  removeBtns[i].onclick = this.removeClick.bind(this)
            }
      }

      reLoad() {
            this.leftDom.innerHTML = ''
            this.rightDom.innerHTML = ''
            this.mergeIndex = 0
            this.mergeJson(this.leftData, this.rightData, this.leftDom, this.rightDom)
            setTimeout(() => {
                  this.reDraw()
                  this.addEvents()
            }, 50);
      }

      //替换json中的转义字符
      replaceChart(obj) {
            const res = JSON.stringify(obj).replaceAll(/\\"/g, "'")
            return JSON.parse(res)
      }
      /* 
      paramKey:作为对象独有的属性作为对象必定存在，判断唯一性

      */

      getKey(obj = {}) {
            if (typeof obj === 'string') {
                  return obj
            }
            return obj.paramKey || obj.propNo || ''
      }


      //request:array.paramKey@parameter:array.paramKey@propType
      formatJson(obj, params = {}) {
            let inputKey = params.diffKey || this.getKey(obj)
            //inputKey = inputKey ? `${inputKey}.` : ''
            let formatKey = (diffKey) => {
                  if (diffKey.endsWith(".")) {
                        return diffKey.slice(0, -1)
                  }
                  return diffKey
            }

            for (const key in obj) {
                  if (Object.hasOwnProperty.call(obj, key)) {
                        const data = obj[key];
                        if (isObject(data)) {
                              //
                              const diffKey = `${inputKey}.${this.getKey(data)}@${key}:${DataType.Object}`
                              this.formatJson(data, { ...params, diffKey: formatKey(diffKey) })
                        } else if (isArray(data)) {
                              //
                              for (let k = 0; k < data.length; k++) {
                                    if (isObject(data[k])) {
                                          const diffKey = `${inputKey}@${key}:${DataType.Array}.${this.getKey(data[k])}`
                                          this.formatJson(data[k], { ...params, diffKey: formatKey(diffKey) })
                                    }
                              }
                        } else {
                              Object.assign(obj, { ...params, diffKey: formatKey(`${inputKey}`) })
                        }

                  }
            }

      }
      //给json对象的key添加后缀
      addSuffix(obj, suffix) {
            for (let key in obj) {
                  if (obj.hasOwnProperty(key)) {
                        if (isObject(obj[key])) {
                              this.addSuffix(obj[key], suffix)
                        }
                        if (isArray(obj[key])) {
                              obj[key].forEach(t => {
                                    this.addSuffix(t, suffix)
                              })
                        }
                        obj[`${key}:${suffix}`] = obj[key]
                        delete obj[key]
                  }
            }
      }
      jsonToStr(obj, num = 2) {
            const str = JSON.stringify(obj, null, num)
            return str.split('\n')
      }


      getValue(key, obj) {
            let excute = (keys, obj) => {
                  if (keys.length === 0) {
                        return obj
                  }
                  const cKey = keys.shift();
                  if (isObject(obj)) {
                        return excute(keys, obj[cKey])
                  }

            }
            const keys = key.split('.');
            excute(keys, obj)
      }

      getKeys(diffKey) {
            return diffKey.split('.').filter(t => t)
      }

      removeBydiffKey(diffKey, obj) {
            const keys = this.getKeys(diffKey);
            // if(keys.length === 1) {

            // }
      }


      addByDiffkey(diffKey, obj, params) {
            const keys = this.getKeys(diffKey);
            if (keys.length === 1) {
                  const { key, value } = this.getObjByParamsKey(keys[0], obj) || params || {}
                  if (key) {
                        obj[key] = value;
                  }
                  return;
            }
            const key = keys.shift();
            if (!obj[key]) {
                  obj[key] = {};
            }
            this.addByDiffkey(obj[key], keys.join('.'), params)
      }
      //获取上一级的数据
      getParentByDiffKey(diffKey, obj) {
            const keys = diffKey.split(".")
            keys.pop()
            return this.getObjByDiffKey(keys.join("."), obj)
      }
      updateByDiffKey(diffKey, obj, params = {}) {
            const val = this.getObjByDiffKey(diffKey, obj)
            const { key, value } = params
            if (!val) {//不存在 则需要进行新增操作
                  const parentData = this.getParentByDiffKey(diffKey, obj)
                  if (!parentData) {
                        obj[key] = value
                        return
                  }
                  if (isArray(parentData)) {
                        //涉及到数组的merge 需要考虑顺序
                        const rightParentData = this.getParentByDiffKey(diffKey, this.rightData)
                        const index = rightParentData.findIndex(t => this.getKey(t) === this.getKey(value))
                        parentData.splice(index, 0, value)
                  }
                  if (isObject(parentData)) {
                        parentData[key] = value
                  }
                  return
            }
            if (isArray(value)) {
                  obj[key] = value
            } else if (isObject(value)) {
                  Object.assign(val, value)
            } else {
                  //需要做新增处理  TODO  目前按照设计  merge是不允许出现行级操作
                  //this.addByDiffkey(diffKey, obj, params)
            }
      }

      getObjByParamsKey(key, obj) {
            let res = null
            Object.keys(obj).forEach(t => {
                  const val = obj[t]
                  if (val.paramKey === key) {
                        res = {
                              key: t,
                              value: val
                        }
                  }
            })
            return res
      }
      getObjByDiffKey(diffKey, obj = {}) {
            const list = this.getKeys(diffKey);
            let res = null
            list.forEach(t => {
                  const arr = t.split(":")
                  const key = arr[0]
                  const keys = key.split("@")
                  const newKey = key.startsWith('@') ? keys[1] : keys[0]
                  if (!key) {
                        //key不可能为空 为空则表示数据有问题
                        return
                  }
                  if (arr.length === 1) {
                        if (!res) {
                              const { value } = this.getObjByParamsKey(newKey, obj) || {}
                              res = value
                        } else {
                              if (isArray(res)) {
                                    res = res.find(t => this.getKey(t) === newKey)
                              }
                        }
                  }
                  if (arr.length === 2) {
                        if (!res) {
                              res = obj[newKey]
                        } else {
                              if (isArray(res)) {
                                    res = res.find(t => this.getKey(t) === newKey)
                              }
                              if (keys.length === 2) {
                                    res = res[keys[1]]
                              }
                        }
                  }
            })

            return res
      }
      createSymbol(item, isFlag) {
            return `<span class="symbol">${isFlag ? '{' : '}'}</span>`
      }
      createIndex(item = {}, symbol) {
            const { status, index, position } = item
            let style = ``
            if (position === 'left') {
                  style += 'left'
            } else {
                  style += ' right'
            }
            if (status) {
                  style += ' status'
            }

            let html = `<div class="line ${style}">`
            const indexDom = `<span style="padding:0 5px;" status="${status}">${index}</span>`
            if (this.mode === '1') {// merge
                  const { value } = item
                  if (typeof value === DataType.Object) {
                        item.dataType = isArray(value) ? DataType.Array : DataType.Object
                  } else {
                        item.dataType = typeof value
                  }
                  if ([Status.rightAdd, Status.Diff].includes(status) && position === 'right' && symbol) {
                        html += `${this.mergeBtn(item)}${indexDom}`
                  } else if (status === Status.LeftAdd && position === 'left' && symbol) {
                        html += `${indexDom}${this.removeBtn(item)}`
                  } else {
                        html += indexDom
                  }
            } else {
                  html += indexDom
            }
            html += '</div>'

            return html
      }
      mergeClick(e) {
            const diffKey = e.currentTarget.getAttribute('diffKey') || ''
            const datatype = e.currentTarget.getAttribute('datatype') || ''
            const key = e.currentTarget.getAttribute('key') || ''
            let data = this.getObjByDiffKey(diffKey, this.rightData)
            if (![DataType.Object, DataType.Array].includes(datatype)) {
                  //
                  const left = this.getObjByDiffKey(diffKey, this.leftData)
                  left[key] = data[key]
                  data = left
            }
            this.updateByDiffKey(diffKey, this.leftData, { key, value: data })
            if (this.afterMerge) {
                  this.afterMerge(this.reLoad)
            } else {
                  this.reLoad()
            }
      }

      removeClick(e) {
            const diffKey = e.currentTarget.getAttribute('diffKey') || ''
            const datatype = e.currentTarget.getAttribute('datatype') || ''
            const key = e.currentTarget.getAttribute('key') || ''
            const left = this.getObjByDiffKey(diffKey, this.leftData)
            if (left[key]) {
                  delete left[key]
            } else {
                  const parentData = this.getParentByDiffKey(diffKey, this.leftData)
                  if (isArray(parentData)) {
                        const index = parentData.findIndex(t => this.getKey(t) === this.getKey(left))
                        parentData.splice(index, 1)
                  }
            }
            this.reLoad()
      }
      createLabel(name, value = '', end = '') {
            return `<div class="merge-label">${this.createName(name)}:${this.createValue(value)}${end}</div>`
      }
      createName(key = '') {
            const name = key
            return `<span class="merge-name">"${name}"</span>`
      }
      createValue(val) {
            return `<span class="merge-value">"${val}"</span>`
      }
      addBtn(key) {
            return `<span class="add-btn"></span>`
      }
      mergeBtn(item) {
            return `<span class="merge-btn" diffKey="${item.diffKey || ''}" datatype="${item.dataType}"  key="${item.key}"> ${mergeIcon} </span>`
      }
      removeBtn(item) {
            return `<span class="remove-btn" diffKey="${item.diffKey || ''}" datatype="${item.dataType}" key="${item.key}">${removeIcon}</span>`
      }

      createUl(item, status) {
            const ul = document.createElement('div')
            ul.className = `parent-item ${status && item !== undefined ? 'status' : ''}`
            return ul
      }


      createLi(item, status) {
            const li = document.createElement('div')
            li.className = `item ${status && item !== undefined ? 'status' : ''}`
            //li.style.background = status && item !== undefined ? '#FDECEE' : '#fff'
            if (item === undefined) {
                  li.style.visibility = 'hidden'
            }
            return li
      }
      //判断两个对象是否相等
      isDeepEqual(obj1, obj2) {
            return JSON.stringify(obj1) === JSON.stringify(obj2)
      }

      //第一个参数是基准参数
      getStatus(value1, value2) {
            let status = ''
            if (value1 === undefined && value2 !== undefined) {
                  status = Status.rightAdd
            }
            if (value1 !== undefined && value2 === undefined) {
                  status = Status.LeftAdd
            }

            if (value1 !== undefined && value2 !== undefined) {
                  if (typeof value1 === DataType.Object && typeof value2 === DataType.Object) {
                        if (isArray(value1) && isArray(value2)) {
                              if (value1.length !== value2.length) {
                                    //只做对象对比
                                    //status = Status.Diff
                              }
                        }
                        if (isObject(value1) && isObject(value2)) {
                              if (this.getKey(value1) !== this.getKey(value2)) {
                                    status = Status.Diff
                              } else {
                                    status = this.isDeepEqual(value1, value2) ? '' : Status.Diff
                              }
                        }
                  } else {
                        if (value1 !== value2) {
                              status = Status.Diff
                        }
                  }
            }

            return status
      }

      getDiffKey(key, value, value1, value2, parent = {}) {
            let res = ''
            const data = value1 || value2
            const end = isObject(value) ? '' : `@${key}`
            if (typeof data === DataType.Object) {
                  if (isArray(data)) {
                        const diffKey = data.diffKey || parent.diffKey
                        if (!value || value.length === 0) {
                              res = diffKey
                        } else {
                              res = `${diffKey}.${key}:${DataType.Array}`
                        }
                  }
                  if (isObject(data)) {
                        res = `${data.diffKey}${end}`
                  }
            } else {
                  res = `${parent.diffKey}@${key}`
            }

            return res
      }

      createLine(page1, page2, params1, params2, symbol) {
            this.mergeIndex++
            params1.index = this.mergeIndex
            params2.index = this.mergeIndex
            page1.innerHTML = `${this.createIndex(params1, symbol)}`
            page2.innerHTML = `${this.createIndex(params2, symbol)}`
      }

      getMergeArr(value1 = [], value2 = []) {
            let mergeArr = value1.concat(value2)
            return mergeArr.filter((t, index) => {
                  return (
                        mergeArr.findIndex((el) => {
                              return this.getKey(el) === this.getKey(t);
                        }) === index
                  );
            })
      }

      mergeJson(obj1 = {}, obj2 = {}, dom1, dom2) {
            const div1 = this.createUl()
            const div2 = this.createUl()
            const startLi1 = this.createLi(obj1)
            const startLi2 = this.createLi(obj2)
            this.mergeIndex++
            const params1 = {
                  position: 'left',
                  status: '',
                  index: this.mergeIndex,
                  value: obj1,
                  diffKey: '',
                  key: ""
            }
            const params2 = { ...params1, position: "right", value: obj2 }
            startLi1.innerHTML = `${this.createIndex(params1, '{')}${this.createSymbol(params1, true)}`
            startLi2.innerHTML = `${this.createIndex(params2, '{')}${this.createSymbol(params2, true)}`
            this.mergeObject(obj1, obj2, div1, div2)
            startLi1.appendChild(div1)
            startLi2.appendChild(div2)
            dom1.appendChild(startLi1)
            dom2.appendChild(startLi2)
            const endLi1 = this.createLi(obj1)
            const endLi2 = this.createLi(obj2)
            this.mergeIndex++
            params1.index = this.mergeIndex
            params2.index = this.mergeIndex
            endLi1.innerHTML = `${this.createIndex(params1)}${this.createSymbol(params1, false)}`
            endLi2.innerHTML = `${this.createIndex(params2)}${this.createSymbol(params2, false)}`
            dom1.appendChild(endLi1)
            dom2.appendChild(endLi2)
      }
      mergeObject(obj1 = {}, obj2 = {}, dom1, dom2) {
            const keys = Array.from(new Set(Object.keys(obj1).concat(Object.keys(obj2))));
            keys.forEach((key, index) => {
                  if (whiteList.includes(key)) {
                        return
                  }
                  const value1 = obj1[key]
                  const value2 = obj2[key]
                  const status1 = this.getStatus(value1, value2)
                  const status2 = this.getStatus(value2, value1)

                  let p1 = value1 !== undefined && typeof value1 !== DataType.Object ? obj1 : value1
                  let p2 = value2 !== undefined && typeof value2 !== DataType.Object ? obj2 : value2
                  const params = {
                        position: 'left',
                        status: status1,
                        index: this.mergeIndex,
                        value: value1,
                        diffKey: this.getDiffKey(key, value1, p1, p2, obj1),
                        key,
                        isEnd: false//表示 ]或者 } 结尾标志
                  }
                  const params2 = {
                        ...params,
                        position: 'right',
                        value: value2,
                        status: !value1 ? status2 : '',
                        diffKey: this.getDiffKey(key, value2, p1, p2, obj2)
                  }
                  const div1 = this.createUl(value1, status1)
                  const div2 = this.createUl(value2, status2)
                  if (typeof value1 === DataType.Object || typeof value2 === DataType.Object) {
                        const startLi1 = this.createLi(value1, status1)
                        const startLi2 = this.createLi(value2, status2)
                        const endLi1 = this.createLi(value1, status1)
                        const endLi2 = this.createLi(value2, status2)
                        if (isObject(value1) || isObject(value2)) {

                              this.createLine(div1, div2, params, params2, '{')
                              div1.innerHTML += `${this.createLabel(key, '{')}`
                              div2.innerHTML += `${this.createLabel(key, '{')}`

                              this.mergeObject(value1, value2, div1, div2)
                              startLi1.appendChild(div1)
                              startLi2.appendChild(div2)
                              dom1.appendChild(startLi1)
                              dom2.appendChild(startLi2)

                              this.createLine(endLi1, endLi2, { ...params, isEnd: true }, { ...params2, isEnd: true })
                              endLi1.innerHTML += `},`
                              endLi2.innerHTML += `},`
                              dom1.appendChild(endLi1)
                              dom2.appendChild(endLi2)

                        } else if (isArray(value1) || isArray(value2)) {
                              //数组
                              if ((value1 === undefined || value1?.length === 0) && (value2 === undefined || value2?.length === 0)) {
                                    this.createLine(startLi1, startLi2, params, params2)
                                    startLi1.innerHTML += `${this.createLabel(key, '[]', ',')}`
                                    startLi2.innerHTML += `${this.createLabel(key, '[]', ',')}`
                                    dom1.appendChild(startLi1)
                                    dom2.appendChild(startLi2)
                                    return
                              } else {
                                    //const maxLength = Math.max(value1?.length || 0, value2?.length || 0);
                                    const mergeArr = this.getMergeArr(value1, value2)
                                    this.createLine(startLi1, startLi2, params, params2)
                                    startLi1.innerHTML += `${this.createLabel(key, '[')}`
                                    startLi2.innerHTML += `${this.createLabel(key, '[')}`
                                    this.mergeArray(value1, value2, div1, div2, mergeArr)
                                    startLi1.appendChild(div1)
                                    startLi2.appendChild(div2)
                                    dom1.appendChild(startLi1)
                                    dom2.appendChild(startLi2)

                                    this.createLine(endLi1, endLi2, { ...params, isEnd: true }, { ...params2, isEnd: true })
                                    endLi1.innerHTML += `],`
                                    endLi2.innerHTML += `],`

                                    dom1.appendChild(endLi1)
                                    dom2.appendChild(endLi2)
                              }

                        }
                  }
                  else {
                        const startLi1 = this.createLi(value1, status1)
                        const startLi2 = this.createLi(value2, status2)
                        this.createLine(startLi1, startLi2, params, params2)
                        startLi1.innerHTML += `${this.createLabel(key, value1, ',')}`
                        startLi2.innerHTML += `${this.createLabel(key, value2, ',')}`
                        dom1.appendChild(startLi1)
                        dom2.appendChild(startLi2)
                  }

                  p1 = null
                  p2 = null
            })
      }

      mergeArray(value1 = [], value2 = [], dom1, dom2, mergeArr) {

            const length1 = value1.length
            const length2 = value2.length
            for (let i = 0; i < mergeArr.length; i++) {
                  // let element1 = value1[i];
                  // let element2 = value2.find(t => this.getKey(t) === this.getKey(element1));
                  // if (length1 < length2) {
                  //       element2 = value2[i];
                  //       element1 = value1.find(t => this.getKey(t) === this.getKey(element2));
                  // }
                  let element1 = null
                  let element2 = null
                  const item = mergeArr[i]
                  if (isObject(item)) {
                        element1 = value1.find(t => this.getKey(t) === this.getKey(item));
                        element2 = value2.find(t => this.getKey(t) === this.getKey(item));
                  }

                  const status1 = this.getStatus(element1, element2)
                  const status2 = this.getStatus(element2, element1)
                  const params1 = {
                        position: 'left',
                        status: status1,
                        index: this.mergeIndex,
                        value: element1,
                        diffKey: element1?.diffKey || element2?.diffKey || '',
                        key: "",
                        isEnd: false
                  }
                  const params2 = {
                        ...params1,
                        position: 'right',
                        status: status2,
                        value: element2,
                  }
                  if (typeof element1 === DataType.Object || typeof element2 === DataType.Object) {
                        const div1 = this.createUl(element1)
                        const div2 = this.createUl(element2)
                        const startLi1 = this.createLi(element1)
                        const startLi2 = this.createLi(element2)
                        const endLi1 = this.createLi(element1)
                        const endLi2 = this.createLi(element2)
                        this.createLine(startLi1, startLi2, params1, params2, '{')
                        startLi1.innerHTML += '{'
                        startLi2.innerHTML += '{'
                        this.mergeObject(element1, element2, div1, div2)
                        startLi1.appendChild(div1)
                        startLi2.appendChild(div2)
                        dom1.appendChild(startLi1)
                        dom2.appendChild(startLi2)

                        this.createLine(endLi1, endLi2, { ...params1, isEnd: true }, { ...params2, isEnd: true })
                        endLi1.innerHTML += '},'
                        endLi2.innerHTML += '},'
                        dom1.appendChild(endLi1)
                        dom2.appendChild(endLi2)
                  } else {
                        const li1 = this.createLi(element1);
                        const li2 = this.createLi(element2);
                        this.createLine(li1, li2, params1, params2)
                        li1.innerHTML += `${this.createValue(element1)}`
                        li2.innerHTML += `${this.createValue(element2)}`
                        dom1.appendChild(li1)
                        dom2.appendChild(li2)
                  }
            }
      }
}








