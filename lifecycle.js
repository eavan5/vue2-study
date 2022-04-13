export function initLifecycle (Vue) {
  Vue.property._render = function () {
    console.log('render');
  }
  Vue.property._update = function () {
    console.log('update');

  }
}


export function mountComponent (vm, el) {
  //1.调用render函数产生虚拟dom
  // vm._render() // vm.$options.render 生成虚拟节点
  //2.根据虚拟dom生成真实dom
  vm.update(vm._render())
  //3.插入到真实dom
}



// Vue核心流程  
// 1) 创建了响应式数据
// 2) 模板转换成ast语法树
// 3) 将ast语法树转换成render函数
// 4) 后续每次数据更新可以直接执行render函数(无需再次执行ast转换的过程)


// render函数会产生虚拟节点(使用响应式数据)
// 根据生成的虚拟节点创建真实的dom