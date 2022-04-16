import { callHook, initLifecycle, mountComponent } from './lifecycle'
import { compileToTFunction } from './compiler'
import { initState } from './state'
import { mergeOptions } from './utils'


export function initMixin (Vue) {  // 给vue真假init方法
  Vue.prototype._init = function (options) { //用于初始化操作
    const vm = this
    // v,.$options  就是获取用户的配置
    // 我们定义的全局指令和过滤器....都会挂载到实例上
    vm.$options = mergeOptions(this.constructor.options, options) // 将用户的options合并到构造函数的options上
    callHook(vm, 'beforeCreate')

    //初始化状态
    initState(vm)
    callHook(vm, 'created')

    initLifecycle(Vue)

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

      mountComponent(vm, el) //组件的挂载


      // script标签如果引用的是vue.global.js 这个编译过程是在浏览器端的
      // runtime是不包括把模板编译的,这个编译打包的过程是放在loader去转译.vue文件的,用runtime的时候不能使用template标签

    }
  }
}


