import { observe } from "./observe/index"

export function initState (vm) {
  const opts = vm.$options
  // if (opts.props) {
  //   initProps()
  // }
  if (opts.data) {
    initData(vm)
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