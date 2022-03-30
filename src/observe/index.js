class Observer {
  constructor(data) {
    // object.defineProperty只能劫持已经存在的属性,后增($set)的或者删除($delete)的不会影响
    this.walk(data)
  }
  walk (data) { // 循环对象 对属性依次劫持
    // "重新定义"属性 所以性能很差
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }
}

export function defineReactive (data, key, value) {  //这个函数是一个闭包

  observe(value) //递归检测 直到是一个简单数据类型为止

  Object.defineProperty(data, key, {
    get () {
      console.log('用户取值');
      return value
    },
    set (newValue) {
      console.log('用户设置值');
      if (newValue === value) return
      observe(newValue) //赋值的时候再去做一个递归
      value = newValue
    }
  })
}

export function observe (data) {
  //只对对象进行劫持
  if (typeof data !== 'object' || data === null) return

  //标记该对象是否被劫持过(要判断一个对象是否被劫持过,可以添加一个实例,用实例来判断是否被劫持过)
  return new Observer(data)

}