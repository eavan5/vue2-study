import { initMixin } from './init'
import { nextTick } from './observe/watcher'



function Vue (options) {
  this._init(options)
}


Vue.prototype.$nextTick = nextTick
initMixin(Vue) // 扩展了init方法


export default Vue