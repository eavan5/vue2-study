import { initGlobalAPI } from './globalAPI'
import { initMixin } from './init'
import { nextTick } from './observe/watcher'



function Vue (options) {
  this._init(options)
}


Vue.prototype.$nextTick = nextTick
initMixin(Vue) // 扩展了init方法

initGlobalAPI(Vue)

export default Vue