import { isSameVnode } from "."

export function createElm (vnode) {
  let { tag, data, children, text } = vnode
  if (typeof tag === 'string') {
    vnode.el = document.createElement(tag) // 这里将真实节点与虚拟节点对应起来,后续如果修改属性,可以通过虚拟节点修改真实节点

    patchProps(vnode.el, {}, data)

    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    })
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

export function patchProps (el, oldProps = {}, props = {}) {
  // console.log(oldProps, props);
  // 老的属性中有,新的没有 要删除老的 
  let oldStyles = oldProps.style || {}
  let newStyles = props.style || {}
  for (const key in oldStyles) { // 老的样式中有 新的样式没有 则删除
    if (!newStyles[key]) {
      el.style[key] = ''
    }
  }

  for (const key in oldProps) { // 老的属性中有 新的属性没有 则删除
    if (!props[key]) {
      el.removeAttribute(key)
    }
  }

  for (const key in props) {  // 用老的覆盖新的
    if (key === 'style') {
      for (const styleName in props.style) {
        el.style[styleName] = props.style[styleName]
      }
    } else {
      el.setAttribute(key, props[key])
    }
  }
}

export function patch (oldVNode, vnode) {
  //写的出渲染流程
  const isRealElement = oldVNode.nodeType
  if (isRealElement) {
    const elm = oldVNode // 获取真实元素
    const parentElm = elm.parentNode // 拿到父元素
    const newElm = createElm(vnode)
    parentElm.insertBefore(newElm, elm.nextSibling)
    parentElm.removeChild(elm)
    return newElm
  } else {
    //diff算法
    // 1. 两个节点不是同一个节点 (直接删除老的,换成新的,不用比对了)
    // 2. 两个节点是同个节点(判断节点的tag和节点的key(如果不存在就是undefined 就是相等的)) 在 比较两个节点的属性是否有差异(复用老的节点,更改差异的属性)
    // 3. 节点比较完成之后,就要比较节点的儿子
    return patchVnode(oldVNode, vnode)

  }
}


function patchVnode (oldVNode, vnode) {
  if (!isSameVnode(oldVNode, vnode)) { // 不是相同的节点
    // 用老节点的父亲 进行替换
    let el = createElm(vnode)
    oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
    return el
  }

  // 文本的情况 文本我们期望比较一下文本的内容
  let el = vnode.el = oldVNode.el // 复用老节点的元素
  if (!oldVNode.tag) { // 是文本
    if (oldVNode.text !== vnode.text) {
      oldVNode.el.textContent = vnode.text // 用新的文本去覆盖掉老的
    }
  }

  // 是标签  我们需要比对标签的属性
  patchProps(el, oldVNode.data, vnode.data)

  // 比较儿子节点  比较的时候
  // 1. 一方有儿子  一方没有儿子
  // 2. 两方都有儿子

  let oldChildren = oldVNode.children || []
  let newChildren = vnode.children || []

  // console.log(oldChildren, newChildren);

  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 完整的diff算法  需要比较两个人的儿子
    updateChildren(el, oldChildren, newChildren)

  } else if (newChildren.length > 0) { // 没有老的,有新的
    mountChildren(el, newChildren)
  } else if (oldChildren.length > 0) { // 新的没有 老的有 要删除
    unMountChildren(el)

  }


}


function mountChildren (el, newChildren) {
  for (let i = 0; i < newChildren.length; i++) {
    const child = newChildren[i];
    el.appendChild(createElm(child))
  }
}


function unMountChildren (el) {
  el.innerText = ''
  let child = el.lastElementChild;
  while (child) {
    el.removeChild(child);
    child = el.lastElementChild;
  }
}

function updateChildren (el, oldChildren, newChildren) {
  // 我们操作列表  经常会有push shift pop unshift  reverse sort  所以我们对这类情况进行优化
  // vue2中采用双指针的方式,比较两个节点
  let oldStartIndex = 0
  let newStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newEndIndex = newChildren.length - 1

  let oldStartVnode = oldChildren[0]
  let newStartVnode = newChildren[0]

  let oldEndVnode = oldChildren[oldEndIndex]
  let newEndVnode = newChildren[newEndIndex]


  function makeIndexByKey (children) {
    let map = {}
    children.forEach((child, index) => {
      map[child.key] = index
    })
    return map
  }

  let map = makeIndexByKey(oldChildren)

  console.log(map);

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 双方有一方头指针大于尾指针 则停止循环

    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex]
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode) // 如果是相同节点,则递归比较子节点
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
      // 比较开头节点
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode) // 如果是相同节点,则递归比较子节点
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
      // 比较结尾节点
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {// 交叉比对  abcd => dcba   头比尾
      patchVnode(oldEndVnode, newStartVnode)
      // insertBefore 具备移动性  会将原来的元素移动走
      el.insertBefore(oldEndVnode.el, oldStartVnode.el) // 将老的尾巴移到老的前面去
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]

    } else if (isSameVnode(oldStartVnode, newEndVnode)) {// 交叉比对  abcd => bcda  尾比头
      patchVnode(oldStartVnode, newEndVnode)
      // insertBefore 具备移动性  会将原来的元素移动走
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = oldChildren[--newEndIndex]
    } else {
      // 乱序比对
      // 根据老的列表做一个映射关系,用新的去找,找到则移动,找不到则添加,最后多余的就删除
      let moveIndex = map[newStartVnode.key] // 如果拿到就说明是我要移动的索引
      if (moveIndex !== undefined) {
        let moveVnode = oldChildren[moveIndex] // 找到对应的虚拟节点 复用
        el.insertBefore(moveVnode.el, oldStartVnode.el)
        oldChildren[moveIndex] = undefined // 表示这个节点被移走了
        patchVnode(oldStartVnode, newEndVnode) // 比对属性和子节点
      } else {
        // 找不到 直接创建一个节点直接插入
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      }
      newStartVnode = newChildren[++newStartIndex]
    }


  }
  // 再给动态列表添加key的时候, 要尽量避免用索引 因为索引都是从0 开始的  所以可能会发成错误复用,增加性能损耗


  if (newStartIndex <= newEndIndex) {  // 新入的多余的插进去
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      const childEl = createElm(newChildren[i])

      // 这里面可能是向后追加 也可能是向前追加
      let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null // 获取下一个元素
      el.insertBefore(childEl, anchor) // anchor 为null的时候则认为是appendChild
    }
  }

  if (oldStartIndex <= oldEndIndex) {  // 老的多余的删除掉
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {
        const childEl = oldChildren[i].el
        el.removeChild(childEl)
      }
    }
  }



  // 我们为了比较两个儿子的时候,提升性能,会有一些优化手段


  console.log(oldStartVnode, newStartVnode, oldEndVnode, newEndVnode);

}

// 如果批量向页面中修改出入内容 浏览器会自动优化  不用createDocumentFragment









