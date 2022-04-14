import { newArrayProto } from "./array"
import Dep from "./dep"

class Observer {
  constructor(data) {
    // object.defineProperty只能劫持已经存在的属性,后增($set)的或者删除($delete)的不会影响

    // 这样不仅给data增加了新的法法,还给数据加了一个标识 如果有这个就说明已经被观察过了
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false //防止被循环引用
    })

    if (Array.isArray(data)) {

      //去重写数组的原型
      Object.setPrototypeOf(data, newArrayProto)

      // 如果数组中放的是对象 也让他去检测到
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }
  walk (data) { // 循环对象 对属性依次劫持
    // "重新定义"属性 所以性能很差
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }
  observeArray (data) {
    data.forEach(item => observe(item))
  }
}

export function defineReactive (data, key, value) {  //这个函数是一个闭包
  observe(value) //递归检测 直到是一个简单数据类型为止

  let dep = new Dep() // 每一个属性都有一个deo用来做依赖收集
  Object.defineProperty(data, key, {
    get () {
      if (Dep.target) {
        dep.depend() // 让这个属性的收集器记住这个watcher
      }

      return value
    },
    set (newValue) {
      if (newValue === value) return
      observe(newValue) //赋值的时候再去做一个递归
      value = newValue
      dep.notify()
    }
  })
}

export function observe (data) {
  //只对对象和数组进行劫持
  if (typeof data !== 'object' || data === null) return

  if (data.__ob__ instanceof Observer) { //说明这个对象被代理过了
    return data.__ob__
  }

  //标记该对象是否被劫持过(要判断一个对象是否被劫持过,可以添加一个实例,用实例来判断是否被劫持过)
  return new Observer(data)

}