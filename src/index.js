import { initGlobalAPI } from './globalAPI'
import { initMixin } from './init'
import Watcher, { nextTick } from './observe/watcher'



function Vue (options) {
  this._init(options)
}


Vue.prototype.$nextTick = nextTick
initMixin(Vue) // 扩展了init方法

initGlobalAPI(Vue)


// 最终调用的都是这个方法
Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
  // console.log(exprOrFn, cb);
  // firstName
  // ()=>vm.firstName
  // firstName的值变化了 直接执行cb函数
  new Watcher(this, exprOrFn, { user: true }, cb)
}



export default Vue