// h() _c()

export function createElementVNode (vm, tag, data = {}, ...children) {
  data ||= {}
  let key = data.key
  if (key) delete data.key
  return vnode(vm, tag, key, data, children)
}

//_v()
export function createTextVNode (vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}


// ast一样?? ast做的是语法层面的转换  描述的是语法本身
// 我们的虚拟dom 是描述的dom元素,可以增加一些自定义的属性
function vnode (vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text
  }
}



export function isSameVnode (vnode1, vnode2) {
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key

}
