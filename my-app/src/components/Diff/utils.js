
const isObject = (obj) => Object.prototype.toString.call(obj) === "[object Object]"
const isArray = (obj) => Object.prototype.toString.call(obj) === "[object Array]"
const whiteList = ['position', 'position:left', 'position:right', 'diffKey', 'diffKey:left', 'diffKey:right', 'isUpdate', 'isEmpty'] //需要跳过校验的字段

const _self = {}
const Status = {
      Add: 'add',
      Delete: 'delete',
      Update: 'update'
}

//替换json中的转义字符
export const replaceChart = (obj) => {
      const res = JSON.stringify(obj).replaceAll(/\\"/g, "'")
      return JSON.parse(res)
}

/* 
      paramsKey:作为对象独有的属性作为对象必定存在，判断唯一性

*/
export const formatObj = (obj, params = {}) => {
      if (typeof obj !== "object") {
            return
      }
      const key = params.diffKey ? `${params.diffKey}.` : ''

      if (isObject(obj)) {
            for (const k in obj) {
                  const newKey = obj[k].paramsKey || isArray(obj[k]) ? `${k}:array` : k
                  formatObj(obj[k], { ...params, diffKey: `${key}${newKey}` })
            }
      }
      if (isArray(obj)) {
            for (let k = 0; k < obj.length; k++) {
                  const newKey = obj[k].paramsKey || ''
                  formatObj(obj[k], { ...params, diffKey: `${key}${newKey}` })
            }
      }
      Object.assign(obj, { ...params, diffKey: key })
}
//给json对象的key添加后缀
export const addSuffix = (obj, suffix) => {
      if (isObject(obj)) {
            for (const key in obj) {
                  if (isObject(obj[key])) {
                        addSuffix(obj[key], suffix)
                  }
                  if (isArray(obj[key])) {
                        obj[key].forEach(t => {
                              addSuffix(t, suffix)
                        })
                  }
                  obj[`${key}:${suffix}`] = obj[key]
                  delete obj[key]
            }
      }
}

const jsonToStr = (obj, num = 2) => {
      const str = JSON.stringify(obj, null, num)
      return str.split('\n')
}


const getObjByValue = (value, obj) => {
      let res = null
      for (const key in obj) {
            if (obj[key] === value) {
                  res = obj
            }
      }
}
const updateByDiffKey = (diffKey, obj, params = {}) => {
      const val = getObjByDiffKey(diffKey, obj) || {}
      Object.assign(val, params)
}

const getObjByDiffKey = (diffKey, obj = {}) => {
      const list = diffKey.split('.')
      let res = null
      list.forEach(t => {
            const arr = t.split(":")
            const key = arr[0]
            if (arr.length === 1) {
                  if (!res) {
                        res = obj[key]
                  } else {
                        if (isArray(res)) {
                              res = res.find(t => t.paramsKey === key)
                        }
                  }
            }
            if (arr.length === 2) {
                  if (!res) {
                        res = obj[key]
                  } else {
                        res = res[key]
                  }
            }
      })

      return res
}
//只比较第一层
const isObjectHasKey = (obj1, obj2) => {
      if (isObject(obj1) && isObject(obj2)) {
            let isEqual = true
            for (const key in obj1) {
                  if (!Object.hasOwnProperty.call(obj2, key)) {
                        isEqual = false
                  }
            }
            return isEqual
      }
      return false
}

//只比较第一层
const isObjectEqualValue = (obj1, obj2) => {
      if (isObject(obj1) && isObject(obj2)) {
            let isEqual = true
            for (const key in obj1) {
                  const val1 = obj1[key]
                  if (whiteList.includes(key)) {
                        return
                  }
                  if (isObject(obj1) || isArray(obj1)) {
                        //如果是对象或者数组 此处不进行比较 只比较对象/数组内部的字符串 
                        return
                  }
                  if (Object.hasOwnProperty.call(obj2, key)) {
                        const val2 = obj2[key];
                        if (val1 !== val2) {
                              isEqual = false
                        }
                  } else {
                        isEqual = false
                  }
            }
            return isEqual
      }
      return false
}

export const jsonDiff = (baseObj, compareObj) => {
      let excute = (t, compareObj) => {
            const obj = getObjByDiffKey(t.diffKey, compareObj)
            if (!obj) {
                  t.isDelete = true
                  return
            }
            if (!isObjectHasKey(t, obj)) {
                  obj.isEmpty = true
                  //Object.assign(t, obj)
            }
            if (!isObjectHasKey(obj, t)) {
                  t.isEmpty = true
                  //Object.assign(obj, t)
            }

            if (!isObjectEqualValue(t, obj)) {
                  t.isUpdate = true
                  updateByDiffKey(t.diffKey, compareObj, { isUpdate: true })
            }
            format(t)
      }

      let format = (left) => {
            for (const key in left) {
                  const value = left[key]
                  if (isObject(value)) {
                        excute(value, compareObj)
                  }
                  if (isArray(value)) {
                        value.forEach(t => {
                              if (isObject(t)) {
                                    excute(t, compareObj)
                              }
                        })
                  }

            }
      }
      format(baseObj)

}

let index = 0
export const displayJson = (data, element, position) => {
      _self.position = position
      index = 0
      const startLi = createLi();
      startLi.innerHTML = createIndex() + "{";
      const ul = createUl()
      formatJson(data, ul)
      startLi.appendChild(ul)
      element.appendChild(startLi);
      const endLi = createLi();
      endLi.innerHTML = createIndex() + "}";
      element.appendChild(endLi);
}
const createIndex = (item = {}, index, position) => {
      let style = `position: absolute;color:rgba(0,0,0,0.26);font-weight: 400;font-size: 12px;
      background: #fff;padding:0 10px;height:18px;line-height:18px;`
      if (position === 'left') {
            style += 'right:0;text-align: right;'
      } else {
            style += 'left:0;'
      }

      if (item.isUpdate) {
            style += 'background:#FDECEE;color:#E34D59;'
      }
      return `<div key="${item.diffKey}" class="line" style="${style}">${index}</div>`
}
const createName = (key = '') => {
      const name = key
      return `<span style="color:rgba(0,0,0,0.6);font-weight: 400;font-size: 12px;">"${name}":</span>`
}
const createValue = (val) => `<span style="color:rgba(0,0,0,0.6);font-weight: 400;font-size: 12px;">"${val}"</span>`
const addBtn = (key) => `<span style="color:#000;">+</span>`
const removeBtn = (key) => `<span style="color:#000;">-</span>`

const createUl = () => {
      const ul = document.createElement('ul')
      //ul.style.position = 'relative'
      return ul
}


const createLi = (item, status) => {
      const li = document.createElement('li')
      li.style.whiteSpace = 'nowrap'
      li.style.listStyle = 'none'
      li.style.textAlign = 'left'
      if (status === Status.Update) {
            li.style.background = '#FDECEE'
      }
      if (item === undefined) {
            li.style.visibility = 'hidden'
      }
      return li
}


const formatArray = (list = [], elem) => {
      list.forEach((item, i, arr) => {
            const li = createLi(item);
            li.style.listStyle = 'none'
            const end = i === arr.length - 1 ? '' : ','
            if (Array.isArray(item)) {
                  li.innerHTML += `[`;
                  if (item.length > 0) {
                        const pul = createUl();
                        formatArray(item, li)
                        li.appendChild(pul)
                  }
                  li.innerHTML += `${createIndex(item)}]${end}`;
            } else if (isObject(item)) {
                  li.innerHTML += `${createIndex(item)}{`;
                  const ul = createUl();
                  formatJson(item, ul)
                  li.appendChild(ul)
                  li.innerHTML += `${createIndex(item)}}${end}`;
            } else {
                  li.innerHTML += `${createIndex(item)}${createValue(item)}${end}`
            }
            elem.appendChild(li)
      })
}

export const formatJson = (data, element) => {
      Object.keys(data).forEach((key, i, arr) => {
            const val = data[key];
            const li = createLi(val);
            const end = i === arr.length - 1 ? '' : ','
            if (whiteList.includes(key)) {
                  return
            }
            li.innerHTML = `${createIndex(data)}${createName(key)} `;
            if (isObject(val)) {
                  li.innerHTML += `{`;
                  const ul = createUl();
                  formatJson(val, ul)
                  li.appendChild(ul)
                  li.innerHTML += `${createIndex(val)}}${end}`;
            } else if (isArray(val)) {
                  li.innerHTML += `[`;
                  if (val.length > 0) {
                        const pul = createUl();
                        formatArray(val, pul)
                        li.appendChild(pul)
                  }
                  li.innerHTML += `${createIndex(val)}]${end}`;
            } else {
                  li.innerHTML += `${createValue(val)}${end}`;
            }
            element.appendChild(li);
      })

}



export const jsonDiff1 = (obj1, obj2) => {
      const diffs = {};
      // 比较两个对象的属性和值
      let compareObjects = (obj1, obj2, path = '') => {
            // 遍历obj1的属性
            for (let key in obj1) {
                  if (obj1.hasOwnProperty(key)) {
                        const newPath = path ? `${path}.${key}` : key;

                        // 如果obj2中不存在该属性，则记录差异
                        if (!obj2.hasOwnProperty(key)) {
                              diffs[newPath] = { oldValue: obj1[key], newValue: undefined };
                        } else {
                              // 递归比较子属性和值
                              if (isObject(obj1[key] && isObject(obj2[key]))) {
                                    compareObjects(obj1[key], obj2[key], newPath);
                              } else {
                                    // 如果值不相等，则记录差异
                                    if (obj1[key] !== obj2[key]) {
                                          diffs[newPath] = { oldValue: obj1[key], newValue: obj2[key] };
                                    }
                              }
                        }
                  }
            }

            // 遍历obj2的属性
            for (let key in obj2) {
                  if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
                        const newPath = path ? `${path}.${key}` : key;

                        // 如果obj1中不存在该属性，则记录差异
                        diffs[newPath] = { oldValue: undefined, newValue: obj2[key] };
                  }
            }
      }
      compareObjects(obj1, obj2);

      return diffs;
}

export const dealJson = (left, right) => {
      const leftList = jsonToStr(left)
      const rightList = jsonToStr(right)
      const map = {}
      leftList.forEach((str, index) => {
            map[index] = {
                  left: {
                        value: str,
                        key: ""
                  },
                  right: ""
            }
      })
      rightList.forEach((str, index) => {
            const { left } = map[index] || {}
            if (left) {
                  let status = ''
                  const { value } = left
                  if (value !== str) {
                        const isFlag = leftList.some(s => s === str)
                        if (isFlag) {
                              status = 'update'
                        } else {
                              status = 'add'
                        }
                  }
                  map[index]['right'] = {
                        value: str,
                        status,
                        key: ""
                  }
            } else {
                  map[index] = {
                        left: {
                              value: "",
                        },
                        right: {
                              value: str,
                              status: 'add',
                              key: ""
                        }
                  }
            }

      })

      console.log(map)
}


//判断 key是否存在
const isExistByKey = (key, obj) => {
      if (typeof obj !== "object") {
            return
      }
      let isExist = false
      let checkIsExist = (obj) => {
            if (obj['paramsKey'] === key) {
                  isExist = true
                  throw new Error(key + ':已存在')
            }
            for (const k in obj) {
                  if (isObject(obj[k])) {
                        checkIsExist(obj[k])
                  }
            }
      }


      for (const k in obj) {
            if (isObject(obj[k])) {
                  checkIsExist(obj[k])
            }
      }

      return isExist

}



export const mergeJson = (json1, json2) => {
      let merged = {};
      // 遍历第一个JSON对象
      for (let key in json1) {
            let newKey = key.replace(/:\w+$/, ''); // 去除后缀并添加前缀
            merged[newKey] = json1[key];
      }
      // 遍历第二个JSON对象
      for (let key in json2) {
            let newKey = key.replace(/:\w+$/, '');
            if (merged.hasOwnProperty(newKey)) {

                  if (merged[newKey] !== json2[key]) {
                        // 若新的键已存在于合并结果中，则将新的值与已存在的值放在一个数组中
                        merged[newKey] = [].concat(merged[newKey], json2[key]);
                  }

            } else {
                  merged[newKey] = json2[key];
            }
      }

      console.log(merged)
      return merged;
}
//第一个参数是基准参数
const getStatus = (value1, value2) => {
      let status = ''
      if (value1 === undefined && value2 !== undefined) {
            status = Status.Add
      }
      if (value1 !== undefined && value2 === undefined) {
            status = Status.Delete
      }

      if (value1 && value2) {
            if (typeof value1 === 'object' && typeof value2 === 'object') {
                  if (isArray(value1) && isArray(value2)) {
                        if (value1.length !== value2.length) {
                              status = Status.Update
                        }
                  }
                  if (isObject(value1) && isObject(value2)) {
                        if (value1['paramsKey'] !== value2['paramsKey']) {
                              status = Status.Add
                        }
                  }
            } else {
                  if (value1 !== value2) {
                        status = Status.Update
                  }
            }
      }

      return status
}

let mergeIndex = 0

export const mergeData = (obj1 = {}, obj2 = {}, dom1, dom2) => {
      const keys = Array.from(new Set(Object.keys(obj1).concat(Object.keys(obj2))));
      keys.forEach((key, index) => {
            const value1 = obj1[key]
            const value2 = obj2[key]
            mergeIndex++
            const startLi1 = createLi(value1, getStatus(value1, value2))
            const startLi2 = createLi(value2, getStatus(value2, value1))
            startLi1.innerHTML = `${createIndex(value1, mergeIndex,'left')}${createName(key)}:`
            startLi2.innerHTML = `${createIndex(value2, mergeIndex)}${createName(key)}:`


            if (typeof value1 === 'object' || typeof value2 === 'object') {
                  const div1 = createUl()
                  const div2 = createUl()
                  const endLi1 = createLi(value1, getStatus(value1, value2))
                  const endLi2 = createLi(value2, getStatus(value2, value1))
                  if (isObject(value1) || isObject(value2)) {
                        startLi1.innerHTML += '{'
                        startLi2.innerHTML += '{'
                        dom1.appendChild(startLi1)
                        dom2.appendChild(startLi2)
                        mergeData(value1, value2, div1, div2)
                        dom1.appendChild(div1)
                        dom2.appendChild(div2)
                        endLi1.innerHTML = '},'
                        endLi2.innerHTML = '},'
                        dom1.appendChild(endLi1)
                        dom2.appendChild(endLi2)
                  } else if (isArray(value1) || isArray(value2)) {
                        //数组

                        if (value1?.length === 0 && value2?.length === 0) {
                              startLi1.innerHTML += '[],'
                              startLi2.innerHTML += '[],'
                              dom1.appendChild(startLi1)
                              dom2.appendChild(startLi2)
                              return
                        }
                        const maxLength = Math.max(value1?.length || 0, value2?.length);
                        startLi1.innerHTML += '['
                        startLi2.innerHTML += '['
                        dom1.appendChild(startLi1)
                        dom2.appendChild(startLi2)
                        mergeArray(value1, value2, div1, div2, maxLength)
                        dom1.appendChild(div1)
                        dom2.appendChild(div2)
                        endLi1.innerHTML = '],'
                        endLi2.innerHTML = '],'
                        dom1.appendChild(endLi1)
                        dom2.appendChild(endLi2)
                  }
            }
            else {
                  startLi1.innerHTML += `${createValue(value1)},`
                  startLi2.innerHTML += `${createValue(value2)},`
                  dom1.appendChild(startLi1)
                  dom2.appendChild(startLi2)
            }
      })
}

const mergeArray = (value1 = [], value2 = [], dom1, dom2, maxLength) => {
      for (let i = 0; i < maxLength; i++) {
            const element1 = value1[i];
            const element2 = value2[i];
            if (typeof element1 === 'object' || typeof element2 === 'object') {
                  const div1 = createUl()
                  const div2 = createUl()
                  const startLi1 = createLi(element1)
                  const startLi2 = createLi(element2)
                  const endLi1 = createLi(element1)
                  const endLi2 = createLi(element2)
                  startLi1.innerHTML = '{'
                  startLi2.innerHTML = '{'
                  dom1.appendChild(startLi1)
                  dom2.appendChild(startLi2)
                  mergeData(element1, element2, div1, div2)
                  dom1.appendChild(div1)
                  dom2.appendChild(div2)
                  endLi1.innerHTML = '},'
                  endLi2.innerHTML = '},'
                  dom1.appendChild(endLi1)
                  dom2.appendChild(endLi2)
            } else {
                  const li1 = createLi(element1);
                  const li2 = createLi(element2);
                  li1.innerHTML += `${createIndex(element1)}${createName(element1)}${createValue(element1)}`
                  li2.innerHTML += `${createIndex(element2)}${createName(element2)}${createValue(element2)}`
                  dom1.appendChild(li1)
                  dom2.appendChild(li2)
            }
      }
}