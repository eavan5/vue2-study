import { initState } from './state'


export function initMixin (Vue) {  // 给vue真假init方法
  Vue.prototype._init = function (options) { //用于初始化操作
    const vm = this
    // v,.$options  就是获取用户的配置
    vm.$options = options

    //初始化状态
    initState(vm)
  }
}


