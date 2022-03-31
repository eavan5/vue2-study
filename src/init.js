import { compileToTFunction } from './compiler'
import { initState } from './state'


export function initMixin (Vue) {  // 给vue真假init方法
  Vue.prototype._init = function (options) { //用于初始化操作
    const vm = this
    // v,.$options  就是获取用户的配置
    vm.$options = options

    //初始化状态
    initState(vm)

    if (options.el) {
      vm.$mount(options.el) //实现数据的挂载
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this
    el = document.querySelector(el)
    let ops = vm.$options
    if (!ops.render) {  // 先去查找有没有render,没有render再去查是否写了template,没写template,再才采取外部template
      let template
      if (!ops.template && el) { //没有写模板 但是写了el
        template = el.outerHTML
      } else {
        if (el) {
          template = ops.template
        }
      }
      if (template) {
        // 对模板进行编译
        const render = compileToTFunction(template)
        ops.render = render
      }


      // script标签如果引用的是vue.global.js 这个编译过程是在浏览器端的
      // runtime是不包括把模板编译的,这个编译打包的过程是放在loader去转译.vue文件的,用runtime的时候不能使用template标签

    }
  }
}


