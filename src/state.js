import Dep from "./observe/dep"
import { observe } from "./observe/index"
import Watcher from "./observe/watcher"

export function initState (vm) {
  const opts = vm.$options
  // if (opts.props) {
  //   initProps()
  // }
  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
}

function proxy (vm, target, key) {
  Object.defineProperty(vm, key, {
    get () {
      return vm[target][key]
    },
    set (newValue) {
      // if (newValue === vm[target][key]) return
      vm[target][key] = newValue
    }
  })
}

function initData (vm) {
  let data = vm.$options.data
  data = typeof data === 'function' ? data.call(vm) : data

  vm._data = data
  observe(data)

  // 将vm._data 用vm来代理就可以了
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      proxy(vm, '_data', key)
    }
  }
}


function initComputed (vm) {
  const computed = vm.$options.computed
  let watchers = vm._computedWatchers = {} // 将计算属性watcher保存到vm上
  for (const key in computed) {
    let userDef = computed[key]

    const fn = typeof userDef === 'function' ? userDef : userDef.get // 计算属性的get方法
    // 我们需要监控计算属性中get的变化 ,将属性和watcher关联起来
    watchers[key] = new Watcher(vm, fn, { lazy: true }) // 如果直接new 就会执行fn,但是我们在计算属性中不需要他立即执行,所以lazy:true

    defineComputed(vm, key, userDef)
  }
}

function defineComputed (target, key, userDef) {
  // const getter = typeof userDef === 'function' ? userDef : userDef.get
  const setter = userDef.set || (() => [])

  // 可以通过实例拿到对应的属性
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter
  })
}

// 计算属性根本不会去收集依赖,只会让自己的依赖属性去收集依赖  vue3跟vue2不一样
function createComputedGetter (key) {
  // 我们要检测是否执行这个getter
  return function () {
    const watcher = this._computedWatchers[key] // 获取对应属性的watcher
    if (watcher.dirty) {
      // 如果是脏值 就去执行用户传入的函数
      watcher.evaluate()  // 求职之后 dirty变成了false 下次就不执行了
    }
    if (Dep.target) { //计算属性watcher出栈之后,还剩下一个渲染watcher,我应该让计算属性watcher里面的属性也去收集上一层的渲染watcher
      watcher.depend()
    }
    return watcher.value // 最后返回的是watcher上的值
  }
}